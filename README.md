# ghostWriter

ghostWriter is a lightweight browser-based markdown editor with live HTML rendering, file export options, and an optional Spookiness mode that introduces playful haunted mutations during rendering.

## Features

- Plain text and markdown editing in a simple textarea
- Rendered HTML preview in a native page layout
- Markdown, plain text, and standalone HTML export
- Optional Spookiness mode for visual drift and text mutations
- Render sound effect on every render
- Persistent markdown reference using a native `details` element
- Automatic list continuation for bullets, numbered lists, and nested lists
- Light and dark mode support based on system preference

## Accessibility

ghostWriter is designed to stay usable as a real writing tool, not only as a prank.

- Native HTML controls are used throughout the interface
- The editor remains a standard textarea
- Status updates are announced through a status region
- The rendered output region is focusable for keyboard review
- The markdown reference can stay open while typing

## Supported Markdown

The current renderer supports:

- Headings
- Paragraphs
- Unordered lists
- Ordered lists
- Nested lists by indentation
- Bold
- Italics
- Strikethrough
- Inline code
- Links
- Images
- Blockquotes
- Horizontal rules
- Fenced code blocks
- Tables

## Exports

ghostWriter can download the current draft as:

- `.md`
- `.txt`
- `.html`

The HTML export is a standalone HTML5 document containing the rendered markdown output.

## Project Structure

- `index.html` - app markup and page structure
- `css/ghostStyle.css` - light theme, dark theme, layout, and motion styling
- `js/ghostWriter.js` - rendering, editor behavior, export logic, spookiness behavior, and status updates

## Usage

Open `index.html` in a browser and start writing.

- Use `Render Output` to generate the HTML preview
- Toggle `Spookiness` depending on whether you want the haunted rendering effects
- Use the example buttons in the markdown reference to insert sample syntax into your draft
- Expand the markdown reference if you want examples while writing

## Notes

This project uses a local markdown library for rendering while layering the ghost effects and export features on top.
