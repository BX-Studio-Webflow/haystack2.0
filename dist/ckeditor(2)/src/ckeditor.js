"use strict";
/**
 * @license Copyright (c) 2014-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ckeditor5_editor_classic_1 = require("@ckeditor/ckeditor5-editor-classic");
const ckeditor5_alignment_1 = require("@ckeditor/ckeditor5-alignment");
const ckeditor5_basic_styles_1 = require("@ckeditor/ckeditor5-basic-styles");
const ckeditor5_block_quote_1 = require("@ckeditor/ckeditor5-block-quote");
const ckeditor5_essentials_1 = require("@ckeditor/ckeditor5-essentials");
const ckeditor5_find_and_replace_1 = require("@ckeditor/ckeditor5-find-and-replace");
const ckeditor5_font_1 = require("@ckeditor/ckeditor5-font");
const ckeditor5_heading_1 = require("@ckeditor/ckeditor5-heading");
const ckeditor5_image_1 = require("@ckeditor/ckeditor5-image");
const ckeditor5_indent_1 = require("@ckeditor/ckeditor5-indent");
const ckeditor5_link_1 = require("@ckeditor/ckeditor5-link");
const ckeditor5_list_1 = require("@ckeditor/ckeditor5-list");
const ckeditor5_media_embed_1 = require("@ckeditor/ckeditor5-media-embed");
const ckeditor5_paragraph_1 = require("@ckeditor/ckeditor5-paragraph");
const ckeditor5_remove_format_1 = require("@ckeditor/ckeditor5-remove-format");
const ckeditor5_select_all_1 = require("@ckeditor/ckeditor5-select-all");
const ckeditor5_source_editing_1 = require("@ckeditor/ckeditor5-source-editing");
const ckeditor5_special_characters_1 = require("@ckeditor/ckeditor5-special-characters");
const ckeditor5_table_1 = require("@ckeditor/ckeditor5-table");
const ckeditor5_typing_1 = require("@ckeditor/ckeditor5-typing");
const ckeditor5_undo_1 = require("@ckeditor/ckeditor5-undo");
const ckeditor5_upload_1 = require("@ckeditor/ckeditor5-upload");
// You can read more about extending the build with additional plugins in the "Installing plugins" guide.
// See https://ckeditor.com/docs/ckeditor5/latest/installation/plugins/installing-plugins.html for details.
class Editor extends ckeditor5_editor_classic_1.ClassicEditor {
}
Editor.builtinPlugins = [
    ckeditor5_alignment_1.Alignment,
    ckeditor5_image_1.AutoImage,
    ckeditor5_block_quote_1.BlockQuote,
    ckeditor5_basic_styles_1.Bold,
    ckeditor5_essentials_1.Essentials,
    ckeditor5_find_and_replace_1.FindAndReplace,
    ckeditor5_font_1.FontColor,
    ckeditor5_font_1.FontSize,
    ckeditor5_heading_1.Heading,
    ckeditor5_image_1.Image,
    ckeditor5_image_1.ImageCaption,
    ckeditor5_image_1.ImageInsert,
    ckeditor5_image_1.ImageResize,
    ckeditor5_image_1.ImageStyle,
    ckeditor5_image_1.ImageToolbar,
    ckeditor5_image_1.ImageUpload,
    ckeditor5_indent_1.Indent,
    ckeditor5_indent_1.IndentBlock,
    ckeditor5_basic_styles_1.Italic,
    ckeditor5_link_1.Link,
    ckeditor5_link_1.LinkImage,
    ckeditor5_list_1.List,
    ckeditor5_media_embed_1.MediaEmbed,
    ckeditor5_media_embed_1.MediaEmbedToolbar,
    ckeditor5_paragraph_1.Paragraph,
    ckeditor5_remove_format_1.RemoveFormat,
    ckeditor5_select_all_1.SelectAll,
    ckeditor5_upload_1.SimpleUploadAdapter,
    ckeditor5_source_editing_1.SourceEditing,
    ckeditor5_special_characters_1.SpecialCharacters,
    ckeditor5_special_characters_1.SpecialCharactersArrows,
    ckeditor5_special_characters_1.SpecialCharactersCurrency,
    ckeditor5_special_characters_1.SpecialCharactersEssentials,
    ckeditor5_special_characters_1.SpecialCharactersLatin,
    ckeditor5_special_characters_1.SpecialCharactersMathematical,
    ckeditor5_special_characters_1.SpecialCharactersText,
    ckeditor5_basic_styles_1.Strikethrough,
    ckeditor5_basic_styles_1.Subscript,
    ckeditor5_basic_styles_1.Superscript,
    ckeditor5_table_1.Table,
    ckeditor5_table_1.TableCaption,
    ckeditor5_table_1.TableCellProperties,
    ckeditor5_table_1.TableColumnResize,
    ckeditor5_table_1.TableProperties,
    ckeditor5_table_1.TableToolbar,
    ckeditor5_typing_1.TextTransformation,
    ckeditor5_basic_styles_1.Underline,
    ckeditor5_undo_1.Undo
];
Editor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'fontSize',
            'fontColor',
            'underline',
            'bold',
            'blockQuote',
            'italic',
            'subscript',
            'superscript',
            'strikethrough',
            'specialCharacters',
            'findAndReplace',
            'alignment',
            'selectAll',
            '|',
            'numberedList',
            'bulletedList',
            '|',
            'indent',
            'outdent',
            '|',
            'link',
            'imageUpload',
            'imageInsert',
            'mediaEmbed',
            '|',
            'insertTable',
            'removeFormat',
            'sourceEditing',
            '|',
            'undo',
            'redo'
        ]
    },
    language: 'en',
    image: {
        toolbar: [
            'imageTextAlternative',
            'toggleImageCaption',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
            'linkImage'
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
