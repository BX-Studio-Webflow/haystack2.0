"use strict";
/**
 * @license Copyright (c) 2014-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ckeditor5_editor_classic_1 = require("@ckeditor/ckeditor5-editor-classic");
const ckeditor5_alignment_1 = require("@ckeditor/ckeditor5-alignment");
const ckeditor5_autoformat_1 = require("@ckeditor/ckeditor5-autoformat");
const ckeditor5_basic_styles_1 = require("@ckeditor/ckeditor5-basic-styles");
const ckeditor5_block_quote_1 = require("@ckeditor/ckeditor5-block-quote");
const ckeditor5_essentials_1 = require("@ckeditor/ckeditor5-essentials");
const ckeditor5_heading_1 = require("@ckeditor/ckeditor5-heading");
const ckeditor5_image_1 = require("@ckeditor/ckeditor5-image");
const ckeditor5_indent_1 = require("@ckeditor/ckeditor5-indent");
const ckeditor5_link_1 = require("@ckeditor/ckeditor5-link");
const ckeditor5_list_1 = require("@ckeditor/ckeditor5-list");
const ckeditor5_media_embed_1 = require("@ckeditor/ckeditor5-media-embed");
const ckeditor5_paragraph_1 = require("@ckeditor/ckeditor5-paragraph");
const ckeditor5_paste_from_office_1 = require("@ckeditor/ckeditor5-paste-from-office");
const ckeditor5_source_editing_1 = require("@ckeditor/ckeditor5-source-editing");
const ckeditor5_table_1 = require("@ckeditor/ckeditor5-table");
const ckeditor5_typing_1 = require("@ckeditor/ckeditor5-typing");
const ckeditor5_undo_1 = require("@ckeditor/ckeditor5-undo");
// You can read more about extending the build with additional plugins in the "Installing plugins" guide.
// See https://ckeditor.com/docs/ckeditor5/latest/installation/plugins/installing-plugins.html for details.
class Editor extends ckeditor5_editor_classic_1.ClassicEditor {
}
Editor.builtinPlugins = [
    ckeditor5_alignment_1.Alignment,
    ckeditor5_image_1.AutoImage,
    ckeditor5_autoformat_1.Autoformat,
    ckeditor5_block_quote_1.BlockQuote,
    ckeditor5_basic_styles_1.Bold,
    ckeditor5_essentials_1.Essentials,
    ckeditor5_heading_1.Heading,
    ckeditor5_image_1.Image,
    ckeditor5_image_1.ImageCaption,
    ckeditor5_image_1.ImageInsert,
    ckeditor5_image_1.ImageResize,
    ckeditor5_image_1.ImageStyle,
    ckeditor5_image_1.ImageToolbar,
    ckeditor5_image_1.ImageUpload,
    ckeditor5_indent_1.Indent,
    ckeditor5_basic_styles_1.Italic,
    ckeditor5_link_1.Link,
    ckeditor5_list_1.List,
    ckeditor5_media_embed_1.MediaEmbed,
    ckeditor5_media_embed_1.MediaEmbedToolbar,
    ckeditor5_paragraph_1.Paragraph,
    ckeditor5_paste_from_office_1.PasteFromOffice,
    ckeditor5_source_editing_1.SourceEditing,
    ckeditor5_table_1.Table,
    ckeditor5_table_1.TableCaption,
    ckeditor5_table_1.TableCellProperties,
    ckeditor5_table_1.TableColumnResize,
    ckeditor5_table_1.TableProperties,
    ckeditor5_table_1.TableToolbar,
    ckeditor5_typing_1.TextTransformation,
    ckeditor5_undo_1.Undo
];
Editor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            'bold',
            'italic',
            'link',
            'alignment',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'imageInsert',
            'imageUpload',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            'undo',
            'redo',
            'sourceEditing'
        ]
    },
    language: 'en',
    image: {
        toolbar: [
            'imageTextAlternative',
            'toggleImageCaption',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableCellProperties',
            'tableProperties'
        ]
    }
};
exports.default = Editor;
