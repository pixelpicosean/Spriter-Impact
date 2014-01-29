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
            var anim;
            anim = this.addSpriterAnim( 'idle', 0.5, 0.5); // idle, 0.5 slower, render 0.5 size
            anim.onComplete.add(function() { console.log('[Testman] idle finished'); });
            anim = this.addSpriterAnim( 'walk', 0.5, 0.5); // walk, 0.5 slower, render 0.5 size
            anim.onComplete.add(function() { console.log('[Testman] walk finished'); });
            anim = this.addSpriterAnim( 'jump', 0.5, 0.5); // jump, 0.5 slower, render 0.5 size
            anim.onComplete.add(function() { console.log('[Testman] jump finished'); });
            anim = this.addSpriterAnim( 'fall', 0.5, 0.5); // fall, 0.5 slower, render 0.5 size
            anim.onComplete.add(function() { console.log('[Testman] fall finished'); });

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
            this.parent();

            var left = ig.input.state('left'),
                right = ig.input.state('right');
            if (this.standing) {
                if (right && !left){
                    this.vel.x = this.speed;
                    this.play(this.anims.walk);
                    this.flip = false;
                }
                else if (left && !right) {
                    this.vel.x = -this.speed;
                    this.play(this.anims.walk);
                    this.flip = true;
                }
                else {
                    this.vel.x = 0;
                    this.play(this.anims.idle);
                }

                if (ig.input.pressed('up')) {
                    this.vel.y = -this.speed * 4;
                }
            }
            else {
                if (this.vel.y > 0){
                    this.play(this.anims.fall);
                } else if (this.vel.y < 0){
                    this.play(this.anims.jump);
                }
            }

            this.currentAnim.flip.x = this.flip;
        }
    });
});
