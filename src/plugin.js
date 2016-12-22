import videojs from 'video.js';
import window from 'global/window';

// Default options for the plugin.
const defaults = {};

const init = function(player, options) {
  player.ready(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    player.addClass('vjs-ssp');

    try {
      const tech = player.tech({ IWillNotUseThisInPlugins: true });
      const context = new AudioContext();
      const source = context.createMediaElementSource(tech.el());
      const compressor = context.createDynamicsCompressor();
      const biquadFilter = context.createBiquadFilter();

      compressor.threshold.value = -15;
      compressor.attack.value = 0;
      compressor.release.value = 0.075;

      biquadFilter.type = 'lowpass';
      biquadFilter.frequency.value = 8192;

      source.connect(compressor);
      compressor.connect(biquadFilter);
      biquadFilter.connect(context.destination);
    } catch (err) {
      videojs.log.warn('Something went wrong when setting up the AudioContext', err);
    }
  });

  const reInit = (newOptions) => {
    init(player, newOptions);
  };

  player.ssp = reInit;
  player.ssp.VERSION = '__VERSION__';
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function ssp
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const ssp = function(options) {
  init(this, videojs.mergeOptions(defaults, options));
};

// Register the plugin with video.js.
videojs.plugin('ssp', ssp);

// Include the version number.
ssp.VERSION = '__VERSION__';

export default ssp;
