// Menu-bar structure for the slides editor. Items carry an `action` key that
// SlidesEditor maps to a handler; items without one render disabled.

export const slideMenus = [
  {
    label: "File",
    groups: [
      [
        { label: "New presentation", action: "new-presentation", shortcut: "Ctrl+Alt+N" },
        { label: "Make a copy", action: "make-copy" },
      ],
      [
        { label: "Download", type: "download" },
        { label: "Share", hasSubmenu: true },
      ],
      [
        { label: "Rename", action: "rename" },
        { label: "Move" },
        { label: "Version history", hasSubmenu: true },
      ],
    ],
  },
  {
    label: "Edit",
    groups: [
      [
        { label: "Undo", action: "undo", shortcut: "Ctrl+Z" },
        { label: "Redo", action: "redo", shortcut: "Ctrl+Y" },
      ],
      [
        { label: "Duplicate", action: "duplicate" },
        { label: "Delete", action: "delete" },
      ],
    ],
  },
  {
    label: "View",
    groups: [
      [
        { label: "Present", action: "present" },
        { label: "Show speaker notes", action: "toggle-notes" },
        { label: "Grid view", action: "toggle-grid" },
      ],
    ],
  },
  {
    label: "Insert",
    groups: [
      [
        { label: "Text box", action: "text" },
        { label: "Image", action: "image" },
        { label: "Shape", action: "shape" },
      ],
    ],
  },
  {
    label: "Slide",
    groups: [
      [
        { label: "New slide", action: "new-slide", shortcut: "Ctrl+M" },
        { label: "Duplicate slide", action: "duplicate-slide" },
        { label: "Delete slide", action: "delete-slide" },
      ],
    ],
  },
  {
    label: "Arrange",
    groups: [
      [
        { label: "Bring forward", action: "forward" },
        { label: "Send backward", action: "backward" },
      ],
    ],
  },
  {
    label: "Tools",
    groups: [
      [
        { label: "Explore" },
        { label: "Linked objects" },
        { label: "Preferences" },
      ],
    ],
  },
  {
    label: "Help",
    groups: [
      [
        { label: "Slides help" },
        { label: "Keyboard shortcuts", shortcut: "Ctrl+/" },
      ],
    ],
  },
];
