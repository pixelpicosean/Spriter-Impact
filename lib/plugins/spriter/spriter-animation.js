/*
    Based on the Spriter.js project created by Flyover Games LLC, Jason Andersen and Isaac Burns, found here: https://github.com/flyover/spriter.js

    The Impact implementation was created by Kristoffer Jetmundsen, e-mail: krisjet@gmail.com, twitter: Krisjet.

    Modified by Sean Bohan, email: pixelpicosean@gmail.com, twitter: PixelPicoSean
*/

ig.module(
    'plugins.spriter.spriter-animation'
)
.requires(
    'impact.timer',
    'impact.image',

    'plugins.extras.spriter'
)
.defines(function(){ "use strict";

    ig.SpriterAnimationSheet = ig.Class.extend({
        // parameters *********************************************************
        width: 0,
        height: 0,

        // do not edit these properties
        /* {ig.spriter.data} spriter scon data */
        data: null,
        /* {ig.spriter.pose} spriter animation object */
        pose: null,

        // methods ************************************************************
        /**
         * constructor
         * @param url    Url of scon file.
         * @param width  Entity width.
         * @param height Entity height.
         */
        init: function (url, width, height) {
            this.width = width;
            this.height = height;

            // load scon
            this.data = new ig.spriter.data();
            var self = this;
            this.data.loadFromURL(url);
            // create spriter animation object
            this.pose = new ig.spriter.pose(self.data);
        }
    });

    ig.SpriterAnimation = ig.Class.extend({

        /* {string} Name of this animation */
        name: '',
        /* Animation time factor: 0.5 runs slow motion, 2.0 runs twice speed */
        timeScale: 0.5,
        /* Note: pivot position is automatically set when init */
        pivot: {x: 0, y: 0},
        /* Note: flip does not work now */
        flip: {x: true, y: true},
        scale: 1,
        /**
         * Rotation of the animation in radians.
         * The center of rotation is specified by .pivot.
         */
        angle: 0,
        /* Alpha of whole animation */
        alpha: 1,

        // do not modify
        loopCount: 0,
        timer: null,
        sheet: null,
        /* {number} duration in ms. To get duration of playing, use getRealLength() instead */
        duration: 0,

        timeCounter: 0,

        // methods ************************************************************
        /**
         * Constructor
         * @param animSheet A SpriterAnimationSheet instance which contains data for this.
         * @param scale     Scale for rendering, default is 1.
         * @param animName  Name of this animation. (An animation with this name must exist
         *                  in the loaded SCML file)
         */
        init: function (animSheet, scale, animName) {
            this.sheet = animSheet;
            this.scale = scale;
            this.timer = new ig.Timer();
            this.name = animName;
            var currAnimId = animSheet.pose.getAnim();
            animSheet.pose.setAnim(animName);
            this.duration = animSheet.pose.getAnimLength();
            animSheet.pose.setAnim(currAnimId);
            // console.log('<SpriterAnimation>: getAnimLength = ' + this.duration);
            // console.log('<SpriterAnimation>: getRealLength = ' + this.getRealLength());
            this.pivot.x = animSheet.width / 2;
            this.pivot.y = animSheet.height;
        },
        /**
         * Return how long this animation will continue.
         * Note: The result is based on timeScale, so it's not the original one in SCML.
         */
        getRealLength: function () {
            return this.duration / this.timeScale * 0.001;
        },
        /**
         * Restart current animation.
         * This MUST be called every time you change the animation, since this method
         *   will set the spriter pose to change to the new animation.
         */
        rewind: function () {
            var pose = this.sheet.pose;

            this.timer.set();
            this.loopCount = 0;

            pose.setAnim(this.name);
            pose.m_time = 0;
            pose.loopCount = 0;

            return this;
        },
        gotoFrame: function( f ) {
            this.timer.set( this.duration * -f );
            this.update();
        },
        gotoRandomFrame: function() {
            this.gotoFrame( Math.floor(Math.random() * this.duration) );
        },
        update : function ()
        {
            var anim_time = this.timer.tick() * this.timeScale * ig.Timer.timeScale * 1000;

            var pose = this.sheet.pose;
            if (pose) {
                pose.update(anim_time);
            }

            // sync loopCount with pose
            this.loopCount = pose.loopCount;

            // [Debug]
            ig.show('anim.loopCount', this.loopCount);
        },
        draw : function (targetX, targetY)
        {
            // TODO: clip drawing only when bounding out of screen
            var ctx_2d = ig.system.context;

            if (ctx_2d)
            {
                ctx_2d.save();

                // 0,0 at center, x right, y up
                ig.system.context.translate(
                    ig.system.getDrawPos(targetX + this.pivot.x),
                    ig.system.getDrawPos(targetY + this.pivot.y)
                );
                var scaleX = this.flip.x ? -1 : 1;
                var scaleY = this.flip.y ? -1 : 1;

                if ( this.flip.x || this.flip.y ) {
                    ctx_2d.scale( scaleX, scaleY );
                }

                // apply camera
                ctx_2d.scale( this.scale, this.scale);
                if (this.angle !== 0){
                    ctx_2d.rotate(this.angle);
                }
                if (!ig.debugMode){
                    this.draw_pose_2d(this.sheet.pose);
                }
                else {
                    this.debug_draw_pose_2d(this.sheet.pose);
                }

                ctx_2d.restore();
            }
        },

        draw_pose_2d: function(pose)
        {
            var ctx_2d = ig.system.context;

            pose.strike();

            if (pose.m_data && pose.m_data.folder_array)
            {
                var folder_array = pose.m_data.folder_array;
                var object_array = pose.m_tweened_object_array;
                for (var object_idx = 0, object_len = object_array.length; object_idx < object_len; ++object_idx)
                {
                    var object = object_array[object_idx];
                    var folder = folder_array[object.folder];
                    var file = folder.file_array[object.file];

                    ctx_2d.save();

                        // apply object transform
                        ctx_2d.translate(object.x, object.y);
                        ctx_2d.rotate(object.angle * Math.PI / 180);
                        ctx_2d.scale(object.scale_x, object.scale_y);

                        // image extents
                        var ex = 0.5 * file.width;
                        var ey = 0.5 * file.height;
                        //ctx_2d.scale(ex, ey);


                        // local pivot in unit (-1 to +1) coordinates
                        var lpx = (object.pivot_x * 2) - 1;
                        var lpy = (object.pivot_y * 2) - 1;
                        //ctx_2d.translate(-lpx, -lpy);
                        ctx_2d.translate(-lpx*ex, -lpy*ey);

                        if (file.image && !file.image.hidden)
                        {
                            ctx_2d.scale(1, -1); // -y for canvas space
                            ctx_2d.globalAlpha = object.a * this.alpha;
                            ctx_2d.drawImage(file.image.data, -ex, -ey, 2*ex, 2*ey);

                            ig.Image.drawCount++;
                        }
                        else
                        {
                            ctx_2d.fillStyle = 'rgba(127,127,127,0.5)';
                            //ctx_2d.fillRect(-1, -1, 2, 2);
                            ctx_2d.fillRect(-ex, -ey, 2*ex, 2*ey);
                        }

                    ctx_2d.restore();
                }
            }
        },

        debug_draw_pose_2d : function (pose)
        {
            var ctx_2d = ig.system.context;

            pose.strike();

            if (pose.m_data && pose.m_data.folder_array)
            {
                // draw objects
                var folder_array = pose.m_data.folder_array;
                var object_array = pose.m_tweened_object_array;
                for (var object_idx = 0, object_len = object_array.length; object_idx < object_len; ++object_idx)
                {
                    var object = object_array[object_idx];
                    var folder = folder_array[object.folder];
                    var file = folder.file_array[object.file];

                    ctx_2d.save();

                        // apply object transform
                        ctx_2d.translate(object.x, object.y);
                        ctx_2d.rotate(object.angle * Math.PI / 180);
                        ctx_2d.scale(object.scale_x, object.scale_y);

                        // image extents
                        var ex = 0.5 * file.width;
                        var ey = 0.5 * file.height;
                        //ctx_2d.scale(ex, ey);

                        // local pivot in unit (-1 to +1) coordinates
                        var lpx = (object.pivot_x * 2) - 1;
                        var lpy = (object.pivot_y * 2) - 1;
                        //ctx_2d.translate(-lpx, -lpy);
                        ctx_2d.translate(-lpx*ex, -lpy*ey);

                        ctx_2d.scale(1, -1); // -y for canvas space

                        ctx_2d.fillStyle = 'rgba(127,127,127,0.5)';
                        //ctx_2d.fillRect(-1, -1, 2, 2);
                        ctx_2d.fillRect(-ex, -ey, 2*ex, 2*ey);

                        ctx_2d.beginPath();
                        ctx_2d.moveTo(0, 0);
                        ctx_2d.lineTo(32, 0);
                        ctx_2d.lineWidth = 2;
                        ctx_2d.lineCap = 'round';
                        ctx_2d.strokeStyle = 'rgba(127,0,0,0.5)';
                        ctx_2d.stroke();

                        ctx_2d.beginPath();
                        ctx_2d.moveTo(0, 0);
                        ctx_2d.lineTo(0, -32);
                        ctx_2d.lineWidth = 2;
                        ctx_2d.lineCap = 'round';
                        ctx_2d.strokeStyle = 'rgba(0,127,0,0.5)';
                        ctx_2d.stroke();

                    ctx_2d.restore();
                }

                // draw bone hierarchy
                var bone_array = pose.m_tweened_bone_array;
                for (var bone_idx = 0, bone_len = bone_array.length; bone_idx < bone_len; ++bone_idx)
                {
                    var bone = bone_array[bone_idx];

                    var parent_index = bone.parent;
                    if (parent_index >= 0)
                    {
                        var parent_bone = bone_array[parent_index];

                        ctx_2d.save();

                            ctx_2d.beginPath();
                            ctx_2d.moveTo(bone.x, bone.y);
                            ctx_2d.lineTo(parent_bone.x, parent_bone.y);
                            ctx_2d.lineWidth = 2;
                            ctx_2d.lineCap = 'round';
                            ctx_2d.strokeStyle = 'grey';
                            ctx_2d.stroke();

                        ctx_2d.restore();
                    }
                }

                // draw bones
                var bone_array = pose.m_tweened_bone_array;
                for (var bone_idx = 0, bone_len = bone_array.length; bone_idx < bone_len; ++bone_idx)
                {
                    var bone = bone_array[bone_idx];

                    ctx_2d.save();

                        // apply bone transform
                        ctx_2d.translate(bone.x, bone.y);
                        ctx_2d.rotate(bone.angle * Math.PI / 180);

                        ctx_2d.beginPath();
                        ctx_2d.moveTo(0, 0);
                        ctx_2d.lineTo(bone.scale_x * 32, 0);
                        ctx_2d.lineWidth = 2;
                        ctx_2d.lineCap = 'round';
                        ctx_2d.strokeStyle = 'red';
                        ctx_2d.stroke();

                        ctx_2d.beginPath();
                        ctx_2d.moveTo(0, 0);
                        ctx_2d.lineTo(0, bone.scale_y * 32);
                        ctx_2d.lineWidth = 2;
                        ctx_2d.lineCap = 'round';
                        ctx_2d.strokeStyle = 'green';
                        ctx_2d.stroke();

                    ctx_2d.restore();
                }
            }
        }
    });

});
