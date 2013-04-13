/**
 * Entity subclass with Spriter defined animations.
 *
 * Created by Sean Bohan, email: pixelpicosean@gmail.com, twitter: PixelPicoSean
 *
 * [Usage]:
 *   1. Inherit this class to be able to use spriter animation.
 *   2. Make Spriter animations and export.
 *   3. (Optional) Add 'flkr_' before flicker image folders. Images inside
 *      these folders MUST have same name with original ones.
 *      File/Folder naming example:
 *        [original]: arms/lower.png, arms/upper.png
 *        [flicker]:  flkr_arms/lower.png, flkr_arms/upper.png
 *      Then set HasSeleton.flkrTint = true to toggle flicker tint.
 * TODO: build flicker images on the fly
 */

ig.module(
    'plugins.spriter.has-skeleton'
)
.requires(
    // [Impact]
    // [Plugin]
    'impact.entity',
    'plugins.spriter.spriter-animation'
)
.defines(function() {

    EntityHasSkeleton = ig.Entity.extend({
        // parameters *********************************************************
        spriterAnimSheet: null,

        // methods ************************************************************
        addSpriterAnim: function(animation, timeScale, scale) {
            if( !this.spriterAnimSheet ) {
                throw( 'No spriterAnimSheet to add the animation ' + animation + ' to.' );
            }
            var s = (scale === undefined) ? 1 : scale;
            var a = new ig.SpriterAnimation(this.spriterAnimSheet, s, animation);
            if (timeScale) a.timeScale = timeScale;
            this.anims[animation] = a;
            if( !this.currentAnim ) {
                this.currentAnim = a;
            }
            return a;
        },

        /**
         * You can use both string or animation instance to set animation.
         * @param animation  Valid animation instance(created by addSpriteAnim) or
         *                   valid animation name.
         * @param force      Force restart current animation?
         */
        play: function (animation, force) {
            var currAnimName = this.currentAnim.name;
            if (typeof(animation) == "string") {
                this.currentAnim = this.anims[animation];
            }
            else {
                this.currentAnim = animation;
            }
            if (force) {
                this.currentAnim.rewind();
            }
            else if (this.currentAnim.name !== currAnimName) {
                this.currentAnim.rewind();
            }
        }
    });

});
