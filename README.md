## SpriterImpact ##
This is a plugin that makes it possible to use Spriter animation data to defined animations with ImpactJS. It's based on Flyover Games LLC, Jason Andersen and Isaac Burns work on Spriter.js that's located on github here: https://github.com/flyover/spriter.js

### Requirements ###
1. ImpactJS. It was developed using 1.22, but I'm sure it will work with most versions.

### Demo (Original) ###
http://www.krisjet.com/spriterDemo

**Demo is now updated with new spriter animation implementation.**

### How to use it ###
> 1. Put all files inside "plugins" folder to `lib/plugins`.
> 2. Create a new entity and add `'plugins.spriter.has-skeleton'` to requires.
> 3. Add a property to the entity: <br>
     `spriterAnimSheet: new ig.SpriterAnimationSheet('media/your_spriter_folder/your_spriter_anim.scml', 64, 64, false),`
> 4. Play animation using: `this.play('your_animation_name');`
> 5. Have fun...

*For more information, just check the source code of demo. I write lots of comments, hope you will not feel sickness :P*


### Known Issues / Future improvements ###
* Preloading of images doesn't work yet, the game starts without downloading images first. TODO.
* Automatically find culling hitbox for the animations.
* <s>Fix "duration" parameter to something that works as intended.</s>
* Draw images using Impacts image class. Now it's only used for loading and storing data.
* <s>Incorporating spiter.js and xml2json.js as impact modules, so you don't have to load them in your index.html.</s>
* Animations that do not loop doesn't work yet.
* Add more features of spriter.js.
