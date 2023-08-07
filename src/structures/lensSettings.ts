export default function (settings) {
  const get = settings.get.bind(settings);
  const set = settings.set.bind(settings);
  return [
    {
      type: 'checkbox',
      get name () { return "Disable lens"; },
      defaultState: get('disableLens', false),
      onToggle: (v) => set('disableLens', v)
    },
    {
      type: 'checkbox',
      get name () { return "Disable anti-aliasing"; },
      defaultState: get('disableAntiAliasing', false),
      onToggle: (v) => set('disableAntiAliasing', v)
    },
    {
      type: 'slider',
      get name () { return "Zoom ratio"; },
      value: Number(get('zoomRatio', 2)).toFixed(),
      minValue: 1,
      maxValue: get('maxZoomRatio', 15),
      onChange: (v) => set('zoomRatio', v),
      renderValue: (v) => `${v.toFixed(1)}x`
    },
    {
      type: 'slider',
      get name () { return "Lens radius"; },
      value: Number(get('lensRadius', 50)).toFixed(),
      minValue: 50,
      maxValue: get('maxLensRadius', 700),
      onChange: (v) => set('lensRadius', v),
      renderValue: (v) => `${v.toFixed(1)}px`
    },
    {
      type: 'slider',
      get name () { return "Lens border radius"; },
      value: Number(get('borderRadius', 50)).toFixed(),
      minValue: 0,
      maxValue: 50,
      onChange: (v) => set('borderRadius', v),
      renderValue: (v) => `${(v * 2).toFixed()}%`
    },
    {
      type: 'slider',
      get name () { return "Scroll step"; },
      value: Number(get('wheelStep', 1)).toFixed(2),
      minValue: 0.1,
      maxValue: 5,
      onChange: (v) => set('wheelStep', v),
      renderValue: (v) => `${v.toFixed(2)}`
    }
  ];
}
