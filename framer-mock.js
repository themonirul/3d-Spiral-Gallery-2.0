export const ControlType = {
  Number: 'number',
  String: 'string',
  Boolean: 'boolean',
  Color: 'color',
  Array: 'array',
  Object: 'object',
  Image: 'image',
  Enum: 'enum',
  Transition: 'transition',
  Font: 'font',
};

export function addPropertyControls() {
  // Safe mock function for build-time execution
}

export const RenderTarget = {
  current() {
    return 'preview';
  },
  canvas: 'canvas',
};
