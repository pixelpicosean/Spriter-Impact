ig.module(
    'game.entities.testman'
)
.requires(
    'plugins.spriter.has-skeleton'
)
.defines(function(){

EntityTestman = EntityHasSkeleton.extend({

        size: {x: 64, y:64},
        maxVel: {x: 400, y: 1000},
        zIndex: 100,
        gravityFactor: 10,
        speed: 110,

        type: ig.Entity.TYPE.NONE, // Player friendly group
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NEVER,

        spriterAnimSheet: new ig.SpriterAnimationSheet('testmann/testmann.scon', 64, 64, false),

        init: function( x, y, settings ) {
            this.parent( x, y, settings );

            // Add the animations
            this.addSpriterAnim( 'idle', 0.5, 0.5); // idle, 0.5 slower, render 0.5 size
            this.addSpriterAnim( 'walk', 0.5, 0.5); // walk, 0.5 slower, render 0.5 size
            this.addSpriterAnim( 'jump', 0.5, 0.5); // jump, 0.5 slower, render 0.5 size
            this.addSpriterAnim( 'fall', 0.5, 0.5); // fall, 0.5 slower, render 0.5 size

            /**
             * DO NOT change animation this way:
             *
             *   this.currentAnim = this.anims.idle;
             *
             * Since I've made some change, which IMO is better:
             */
             this.play('idle');
             // or this.play(this.anims.idle);

        },


        update: function() {
            if(ig.input.state('right') && this.standing){
                this.vel.x = this.speed;
                this.play(this.anims.walk);
                this.flip = false;
            } else if (ig.input.state('left') && this.standing){
                this.vel.x = -this.speed;
                this.play(this.anims.walk);
                this.flip = true;
            } else if (this.vel.y > 0){
                this.play(this.anims.fall);
            } else if (this.vel.y < 0){
                this.play(this.anims.jump);
            } else {
                this.play(this.anims.idle);
                this.vel.x = 0;
            }
            if(ig.input.pressed('up') && this.standing){
                this.vel.y = -this.speed*4;
                //this.accel.y = 0;
            }
            this.currentAnim.flip.x = this.flip;
            // move!
            this.parent();

        }
    });
});
