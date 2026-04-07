# Ghost Writer

Ghost Writer is a lightweight browser-based markdown editor with live HTML rendering, file export options, and an optional Spookiness mode that introduces playful haunted mutations during rendering.

## Features

- Plain text and markdown editing in a simple textarea
- Rendered HTML preview in a native page layout
- Markdown, plain text, and standalone HTML export
- Optional Spookiness mode for visual drift and text mutations
- Render sound effect on every render
- Persistent markdown reference using a native `details` element
- Indent and outdent controls for keyboard-only and screen reader workflows
- Automatic list continuation for bullets, numbered lists, and nested lists
- Light and dark mode support based on system preference

## Accessibility

Ghost Writer is designed to stay usable as a real writing tool, not only as a prank.

- Native HTML controls are used throughout the interface
- The editor remains a standard textarea
- Status updates are announced through a status region
- Selection-aware indent and outdent controls work even after focus moves away from the textarea
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

Ghost Writer can download the current draft as:

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
- Leave Spookiness checked for the haunted version
- Uncheck Spookiness to use Ghost Writer as a straightforward markdown editor
- Use `Indent` and `Outdent` to adjust selected lines without losing your selection workflow
- Expand the markdown reference if you want examples while writing

## Notes

This project uses a custom markdown renderer implemented in JavaScript rather than an external markdown library. It supports a broad authoring set for this app, but it is not intended to be a full CommonMark or GitHub Flavored Markdown reference implementation.
