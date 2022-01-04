import jQuery from 'jquery'
import ImageResource from 'image-resource-js'


const IrisExtension = {
  /**
   * attach listener for alpha 
   */
  addListenerForAlpha: function() {
    const self = this 
    if (self.option(['alphaReset']))  {
      self.picker.find( '.iris-palette-container' ).on(
        'click.palette', '.iris-palette', function() {
        self._color._alpha = 1;
      })
    }
  },
  /**
   * attach alpha slider widget
   */
  attachAlphaSlider: function() {
    if (this.option('alphaEnabled')) {
        this._createAlphaSlider()
        this.relocateSliders()
        this.addListenerForAlpha()
        this._syncStripAlphaWithColor()
    }
  },
  /**
   * create alpha slider
   */
  _createAlphaSlider: function() {
    // Create Alpha controls
    const self = this
    const stripAlpha = self.controls.strip.clone(false, false)
    const stripAlphaSlider = stripAlpha.find( '.iris-slider-offset' )
    const controls = {
      stripAlpha       : stripAlpha,
      stripAlphaSlider : stripAlphaSlider
    }
    const stripOrientation =
    self.horizontalSlider ? 'horizontal' : 'vertical';

    stripAlpha.addClass( 'iris-strip-alpha' );
    stripAlphaSlider.addClass( 'iris-slider-offset-alpha' );
    stripAlpha.appendTo( self.picker.find( '.iris-picker-inner' ) );
    Object.assign(self.controls, controls);

    const slideEventHdlr = (evt, ui) => {
      self.active = 'strip-alpha';
      // Update alpha value
      self._color._alpha = self._getAlphaValueFromUi()
      self._change.apply( self, arguments );
    }
    // Create slider
    self.controls.stripAlphaSlider.slider({
      orientation: stripOrientation,
      min: 0,
      max: 100,
      step: 1,
      value: parseInt( self._color._alpha * 100 ),
      slide: slideEventHdlr
    })  
  },
  /**
   * synchronize strip alpha with this color property
   */
  _syncStripAlphaWithColor: function() {
    const self = this
    const alpha = parseInt( self._color._alpha * 100 )
    const color = self._color.toRgb()
    const gradient = [
      'rgb(' + color.r + ',' + color.g + ',' + color.b + ') 0%',
      'rgba(' + color.r + ',' + color.g + ',' + color.b + ', 0) 100%'
    ]
    const strGradient = gradient.join(', ')
    const backgroundImages = [
      `linear-gradient(${strGradient})`,
      `url(${ImageResource.checker16DataImage})`
    ]
    self.controls.stripAlpha.css({ 
      backgroundImage : backgroundImages.join(', ') ,
      backgroundPosition: 'center, center',
      backgroundRepeat: 'no-repeat, repeat',
      backgroundSize: 'cover, auto'
    });
  },
  /**
   * Create the controls sizes
   *
   * @since 3.0.0
   * @access private
   *
   * @param {bool} reset Set to True for recreate the controls sizes.
   *
   * @return {void}
   */
    _dimensions: function( reset ) {
      this._super()
      if ( this.option('alphaEnabled') ) {
        this.reocateSliders()
      }
    },
  /**
   * relocate sliders which cotains alpha slider
   */
  relocateSliders: function() {
    const self = this
    const opts = self.options
    const controls = self.controls
    const square = controls.square
    const strip = self.picker.find( '.iris-strip' )
    /**
     * I use Math.round() to avoid possible size errors,
     * this function returns the value of a number rounded
     * to the nearest integer.
     *
     * The width to append all widgets,
     * if border is enabled, 22 is subtracted.
     * 20 for css left and right property
     * 2 for css border
     */
    const innerWidth = Math.round(
      self.picker.outerWidth( true ) - ( opts.border ? 22 : 0 ) );
    // The width of the draggable, aka square.
    const squareWidth = Math.round( square.outerWidth() );
    // The width for the sliders
    let stripWidth = Math.round( ( innerWidth - squareWidth ) / 2 );
    // The margin for the sliders
    let stripMargin = Math.round( stripWidth / 2 );
    // The total width of the elements.
    let totalWidth = Math.round(
      squareWidth + ( stripWidth * 2 ) + ( stripMargin * 2 ) );

    // Check and change if necessary.
    while ( totalWidth > innerWidth ) {
      stripWidth = Math.round( stripWidth - 2 );
      stripMargin = Math.round( stripMargin - 1 );
      totalWidth = Math.round(
      squareWidth + ( stripWidth * 2 ) + ( stripMargin * 2 ) );
    }
    square.css( 'margin', '0' );
    strip.width( stripWidth ).css( 'margin-left', stripMargin + 'px' );
  },

  /**
   * update user interface
   */
  _paint: function() {
    this._super()
    if ( this.option('alphaEnabled') ) {
      if (this.active !== 'strip-alpha') {
          this._syncStripAlphaWithColor()
      }
    }
  },
  /**
   * Paint dimensions.
   *
   * @since 3.0.0
   * @access private
   *
   * @param {string} origin  Origin (position).
   * @param {string} control Type of the control,
   *
   * @return {void}
   */
  _paintDimension: function( origin, control ) {
    const self = this
    // Fix for slider hue opacity.
    if (self.option('alphaEnabled')) {
      if ('strip' === control) {
        const alpha = self._color.a();
        self._color.a(1)
        self._super( origin, control )
        self._color.a(alpha)
      } else {
        self._super( origin, control );
      }
    } else {
      self._super( origin, control );
    }
  },

  /**
   * get alpha value from user interface
   */
  _getAlphaValueFromUi: function() {
    const alphaSlider = this.controls.stripAlphaSlider
    let result = undefined
    if (alphaSlider !== void(0)) {
      result = parseFloat(alphaSlider.slider('value') / 100)
    }
    return result
  },
  /**
   * set alpha value into user interface
   */
  _setAlphaValueToUi: function(alphaValue) {
    const alphaSlider = this.controls.stripAlphaSlider
    if (alphaSlider !== void(0)) {
      let newValue = alphaValue
      newValue *= 100
      newValue = Math.min(100, Math.max(0, newValue))
      alphaSlider.slider('value', newValue)
    }
  },
  /**
   * handle event which is raized by some user input.
   */
  _change: function() {
    const active = this.active
    this._super()

    if (active === 'external') {
      if (this.option('alphaEnabled')) {
        const color = this.color(true)
        const uiValue = this._getAlphaValueFromUi() 
        if (uiValue != color.a()) {
          this._setAlphaValueToUi(color.a()) 
        }
      }
    }
  }

}

/**
 * automattic iris extension
 */
class IrisAlpha {


  /**
   * bind this into some objects in evironment
   */
  bind() {
	  jQuery.widget('a8c.iris', jQuery.a8c.iris, IrisExtension)
  }


  /**
   * detach  this from some objecs in evironment
   */
  unbind() {
  }
}


export { IrisAlpha as default }
//  vi: se ts=2 sw=2 et:
