# ghostWriter

ghostWriter is a lightweight browser-based markdown editor with on-demand HTML rendering, file export options, and an optional Spookiness mode that introduces playful haunted mutations during rendering.

## Features

- Plain text and markdown editing in a simple textarea
- Rendered HTML preview in a native page layout
- Markdown source, readable plain text, and standalone HTML export
- Optional HTML styling with Warm paper and Midnight colors
- Optional linked HTML table of contents
- Optional Spookiness mode for visual drift and text mutations
- Render sound effect when browser audio is available
- Persistent markdown reference using a native `details` element
- Automatic list continuation for bullets, numbered lists, and nested lists outside fenced code blocks
- Indent and outdent controls with tabs, two spaces, or four spaces
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

Markdown preserves the source exactly. Plain Text removes Markdown formatting while keeping readable headings, paragraphs, lists, link destinations, image descriptions, and table contents. Code keeps its punctuation, indentation, and line breaks.

HTML is a standalone HTML5 document. Expand HTML under Export to choose Styled document and Table of contents, then use Download HTML. Styling is on by default and follows light or dark appearance using ghostWriter’s Warm paper and Midnight palettes. Turn styling off for an unstyled document. Contents is off by default; enabling it adds a collapsed disclosure with nested heading links after an opening title, or before the content when there is no opening title. Empty headings and an opening level-one title are omitted from its entries. These settings apply to the download, not the editor preview.

## Project Structure

- `index.html` - app markup and page structure
- `css/ghostStyle.css` - light theme, dark theme, layout, and motion styling
- `js/ghostWriter.js` - rendering, editor behavior, export logic, spookiness behavior, and status updates

## Usage

Open `index.html` in a browser and start writing.

- Use `Render Output` to generate the HTML preview
- Leave `Spookiness` unchecked to render your draft as written; enabling it changes words in the draft and animates the preview
- Render Output moves focus to the preview and plays a sound when browser audio is available
- Use the example buttons in the markdown reference to insert sample syntax into your draft
- Expand the markdown reference if you want examples while writing
- Use Indent or Outdent for the current line or selected lines; in the editor, Command+] and Command+[ on Mac or Control+] and Control+[ on Windows and Linux do the same
- Align nested list markers with the start of the parent item’s text: two spaces after a bullet marker, three after `1. `, or four after `10. `
- Download your draft before closing or reloading the page; the app does not save drafts automatically

## Notes

This project uses a local markdown library for rendering while layering the ghost effects and export features on top.
