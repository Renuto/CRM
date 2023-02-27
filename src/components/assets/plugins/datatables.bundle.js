/*! DataTables 1.10.25
 * ©2008-2021 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     DataTables
 * @description Paginate, search and order HTML tables
 * @version     1.10.25
 * @file        jquery.dataTables.js
 * @author      SpryMedia Ltd
 * @contact     www.datatables.net
 * @copyright   Copyright 2008-2021 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/*jslint evil: true, undef: true, browser: true */
/*globals $,require,jQuery,define,_selector_run,_selector_opts,_selector_first,_selector_row_indexes,_ext,_Api,_api_register,_api_registerPlural,_re_new_lines,_re_html,_re_formatted_numeric,_re_escape_regex,_empty,_intVal,_numToDecimal,_isNumber,_isHtml,_htmlNumeric,_pluck,_pluck_order,_range,_stripHtml,_unique,_fnBuildAjax,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnAjaxDataSrc,_fnAddColumn,_fnColumnOptions,_fnAdjustColumnSizing,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnVisbleColumns,_fnGetColumns,_fnColumnTypes,_fnApplyColumnDefs,_fnHungarianMap,_fnCamelToHungarian,_fnLanguageCompat,_fnBrowserDetect,_fnAddData,_fnAddTr,_fnNodeToDataIndex,_fnNodeToColumnIndex,_fnGetCellData,_fnSetCellData,_fnSplitObjNotation,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnGetDataMaster,_fnClearTable,_fnDeleteIndex,_fnInvalidate,_fnGetRowElements,_fnCreateTr,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAddOptionsHtml,_fnDetectHeader,_fnGetUniqueThs,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnFilterCreateSearch,_fnEscapeRegex,_fnFilterData,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnInfoMacros,_fnInitialise,_fnInitComplete,_fnLengthChange,_fnFeatureHtmlLength,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnFeatureHtmlTable,_fnScrollDraw,_fnApplyToChildren,_fnCalculateColumnWidths,_fnThrottle,_fnConvertToWidth,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnSortFlatten,_fnSort,_fnSortAria,_fnSortListener,_fnSortAttachListener,_fnSortingClasses,_fnSortData,_fnSaveState,_fnLoadState,_fnSettingsFromNode,_fnLog,_fnMap,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnLengthOverflow,_fnRenderer,_fnDataSource,_fnRowAttributes*/

(function( factory ) {
	"use strict";

	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				// CommonJS environments without a window global must pass a
				// root. This will give an error otherwise
				root = window;
			}

			if ( ! $ ) {
				$ = typeof window !== 'undefined' ? // jQuery's factory checks for a global window
					require('jquery') :
					require('jquery')( root );
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}
(function( $, window, document, undefined ) {
	"use strict";

	/**
	 * DataTables is a plug-in for the jQuery Javascript library. It is a highly
	 * flexible tool, based upon the foundations of progressive enhancement,
	 * which will add advanced interaction controls to any HTML table. For a
	 * full list of features please refer to
	 * [DataTables.net](href="http://datatables.net).
	 *
	 * Note that the `DataTable` object is not a global variable but is aliased
	 * to `jQuery.fn.DataTable` and `jQuery.fn.dataTable` through which it may
	 * be  accessed.
	 *
	 *  @class
	 *  @param {object} [init={}] Configuration object for DataTables. Options
	 *    are defined by {@link DataTable.defaults}
	 *  @requires jQuery 1.7+
	 *
	 *  @example
	 *    // Basic initialisation
	 *    $(document).ready( function {
	 *      $('#example').dataTable();
	 *    } );
	 *
	 *  @example
	 *    // Initialisation with configuration options - in this case, disable
	 *    // pagination and sorting.
	 *    $(document).ready( function {
	 *      $('#example').dataTable( {
	 *        "paginate": false,
	 *        "sort": false
	 *      } );
	 *    } );
	 */
	var DataTable = function ( options )
	{
		/**
		 * Perform a jQuery selector action on the table's TR elements (from the tbody) and
		 * return the resulting jQuery object.
		 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
		 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
		 *  @param {string} [oOpts.filter=none] Select TR elements that meet the current filter
		 *    criterion ("applied") or all TR elements (i.e. no filter).
		 *  @param {string} [oOpts.order=current] Order of the TR elements in the processed array.
		 *    Can be either 'current', whereby the current sorting of the table is used, or
		 *    'original' whereby the original order the data was read into the table is used.
		 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
		 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
		 *    'current' and filter is 'applied', regardless of what they might be given as.
		 *  @returns {object} jQuery object, filtered by the given selector.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Highlight every second row
		 *      oTable.$('tr:odd').css('backgroundColor', 'blue');
		 *    } );
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to rows with 'Webkit' in them, add a background colour and then
		 *      // remove the filter, thus highlighting the 'Webkit' rows only.
		 *      oTable.fnFilter('Webkit');
		 *      oTable.$('tr', {"search": "applied"}).css('backgroundColor', 'blue');
		 *      oTable.fnFilter('');
		 *    } );
		 */
		this.$ = function ( sSelector, oOpts )
		{
			return this.api(true).$( sSelector, oOpts );
		};
		
		
		/**
		 * Almost identical to $ in operation, but in this case returns the data for the matched
		 * rows - as such, the jQuery selector used should match TR row nodes or TD/TH cell nodes
		 * rather than any descendants, so the data can be obtained for the row/cell. If matching
		 * rows are found, the data returned is the original data array/object that was used to
		 * create the row (or a generated array if from a DOM source).
		 *
		 * This method is often useful in-combination with $ where both functions are given the
		 * same parameters and the array indexes will match identically.
		 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
		 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
		 *  @param {string} [oOpts.filter=none] Select elements that meet the current filter
		 *    criterion ("applied") or all elements (i.e. no filter).
		 *  @param {string} [oOpts.order=current] Order of the data in the processed array.
		 *    Can be either 'current', whereby the current sorting of the table is used, or
		 *    'original' whereby the original order the data was read into the table is used.
		 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
		 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
		 *    'current' and filter is 'applied', regardless of what they might be given as.
		 *  @returns {array} Data for the matched elements. If any elements, as a result of the
		 *    selector, were not TR, TD or TH elements in the DataTable, they will have a null
		 *    entry in the array.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the data from the first row in the table
		 *      var data = oTable._('tr:first');
		 *
		 *      // Do something useful with the data
		 *      alert( "First cell is: "+data[0] );
		 *    } );
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to 'Webkit' and get all data for
		 *      oTable.fnFilter('Webkit');
		 *      var data = oTable._('tr', {"search": "applied"});
		 *
		 *      // Do something with the data
		 *      alert( data.length+" rows matched the search" );
		 *    } );
		 */
		this._ = function ( sSelector, oOpts )
		{
			return this.api(true).rows( sSelector, oOpts ).data();
		};
		
		
		/**
		 * Create a DataTables Api instance, with the currently selected tables for
		 * the Api's context.
		 * @param {boolean} [traditional=false] Set the API instance's context to be
		 *   only the table referred to by the `DataTable.ext.iApiIndex` option, as was
		 *   used in the API presented by DataTables 1.9- (i.e. the traditional mode),
		 *   or if all tables captured in the jQuery object should be used.
		 * @return {DataTables.Api}
		 */
		this.api = function ( traditional )
		{
			return traditional ?
				new _Api(
					_fnSettingsFromNode( this[ _ext.iApiIndex ] )
				) :
				new _Api( this );
		};
		
		
		/**
		 * Add a single new row or multiple rows of data to the table. Please note
		 * that this is suitable for client-side processing only - if you are using
		 * server-side processing (i.e. "bServerSide": true), then to add data, you
		 * must add it to the data source, i.e. the server-side, through an Ajax call.
		 *  @param {array|object} data The data to be added to the table. This can be:
		 *    <ul>
		 *      <li>1D array of data - add a single row with the data provided</li>
		 *      <li>2D array of arrays - add multiple rows in a single call</li>
		 *      <li>object - data object when using <i>mData</i></li>
		 *      <li>array of objects - multiple data objects when using <i>mData</i></li>
		 *    </ul>
		 *  @param {bool} [redraw=true] redraw the table or not
		 *  @returns {array} An array of integers, representing the list of indexes in
		 *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to
		 *    the table.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    // Global var for counter
		 *    var giCount = 2;
		 *
		 *    $(document).ready(function() {
		 *      $('#example').dataTable();
		 *    } );
		 *
		 *    function fnClickAddRow() {
		 *      $('#example').dataTable().fnAddData( [
		 *        giCount+".1",
		 *        giCount+".2",
		 *        giCount+".3",
		 *        giCount+".4" ]
		 *      );
		 *
		 *      giCount++;
		 *    }
		 */
		this.fnAddData = function( data, redraw )
		{
			var api = this.api( true );
		
			/* Check if we want to add multiple rows or not */
			var rows = Array.isArray(data) && ( Array.isArray(data[0]) || $.isPlainObject(data[0]) ) ?
				api.rows.add( data ) :
				api.row.add( data );
		
			if ( redraw === undefined || redraw ) {
				api.draw();
			}
		
			return rows.flatten().toArray();
		};
		
		
		/**
		 * This function will make DataTables recalculate the column sizes, based on the data
		 * contained in the table and the sizes applied to the columns (in the DOM, CSS or
		 * through the sWidth parameter). This can be useful when the width of the table's
		 * parent element changes (for example a window resize).
		 *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *
		 *      $(window).on('resize', function () {
		 *        oTable.fnAdjustColumnSizing();
		 *      } );
		 *    } );
		 */
		this.fnAdjustColumnSizing = function ( bRedraw )
		{
			var api = this.api( true ).columns.adjust();
			var settings = api.settings()[0];
			var scroll = settings.oScroll;
		
			if ( bRedraw === undefined || bRedraw ) {
				api.draw( false );
			}
			else if ( scroll.sX !== "" || scroll.sY !== "" ) {
				/* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
				_fnScrollDraw( settings );
			}
		};
		
		
		/**
		 * Quickly and simply clear a table
		 *  @param {bool} [bRedraw=true] redraw the table or not
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
		 *      oTable.fnClearTable();
		 *    } );
		 */
		this.fnClearTable = function( bRedraw )
		{
			var api = this.api( true ).clear();
		
			if ( bRedraw === undefined || bRedraw ) {
				api.draw();
			}
		};
		
		
		/**
		 * The exact opposite of 'opening' a row, this function will close any rows which
		 * are currently 'open'.
		 *  @param {node} nTr the table row to 'close'
		 *  @returns {int} 0 on success, or 1 if failed (can't find the row)
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnClose = function( nTr )
		{
			this.api( true ).row( nTr ).child.hide();
		};
		
		
		/**
		 * Remove a row for the table
		 *  @param {mixed} target The index of the row from aoData to be deleted, or
		 *    the TR element you want to delete
		 *  @param {function|null} [callBack] Callback function
		 *  @param {bool} [redraw=true] Redraw the table or not
		 *  @returns {array} The row that was deleted
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Immediately remove the first row
		 *      oTable.fnDeleteRow( 0 );
		 *    } );
		 */
		this.fnDeleteRow = function( target, callback, redraw )
		{
			var api = this.api( true );
			var rows = api.rows( target );
			var settings = rows.settings()[0];
			var data = settings.aoData[ rows[0][0] ];
		
			rows.remove();
		
			if ( callback ) {
				callback.call( this, settings, data );
			}
		
			if ( redraw === undefined || redraw ) {
				api.draw();
			}
		
			return data;
		};
		
		
		/**
		 * Restore the table to it's original state in the DOM by removing all of DataTables
		 * enhancements, alterations to the DOM structure of the table and event listeners.
		 *  @param {boolean} [remove=false] Completely remove the table from the DOM
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnDestroy();
		 *    } );
		 */
		this.fnDestroy = function ( remove )
		{
			this.api( true ).destroy( remove );
		};
		
		
		/**
		 * Redraw the table
		 *  @param {bool} [complete=true] Re-filter and resort (if enabled) the table before the draw.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
		 *      oTable.fnDraw();
		 *    } );
		 */
		this.fnDraw = function( complete )
		{
			// Note that this isn't an exact match to the old call to _fnDraw - it takes
			// into account the new data, but can hold position.
			this.api( true ).draw( complete );
		};
		
		
		/**
		 * Filter the input based on data
		 *  @param {string} sInput String to filter the table on
		 *  @param {int|null} [iColumn] Column to limit filtering to
		 *  @param {bool} [bRegex=false] Treat as regular expression or not
		 *  @param {bool} [bSmart=true] Perform smart filtering or not
		 *  @param {bool} [bShowGlobal=true] Show the input global filter in it's input box(es)
		 *  @param {bool} [bCaseInsensitive=true] Do case-insensitive matching (true) or not (false)
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sometime later - filter...
		 *      oTable.fnFilter( 'test string' );
		 *    } );
		 */
		this.fnFilter = function( sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive )
		{
			var api = this.api( true );
		
			if ( iColumn === null || iColumn === undefined ) {
				api.search( sInput, bRegex, bSmart, bCaseInsensitive );
			}
			else {
				api.column( iColumn ).search( sInput, bRegex, bSmart, bCaseInsensitive );
			}
		
			api.draw();
		};
		
		
		/**
		 * Get the data for the whole table, an individual row or an individual cell based on the
		 * provided parameters.
		 *  @param {int|node} [src] A TR row node, TD/TH cell node or an integer. If given as
		 *    a TR node then the data source for the whole row will be returned. If given as a
		 *    TD/TH cell node then iCol will be automatically calculated and the data for the
		 *    cell returned. If given as an integer, then this is treated as the aoData internal
		 *    data index for the row (see fnGetPosition) and the data for that row used.
		 *  @param {int} [col] Optional column index that you want the data of.
		 *  @returns {array|object|string} If mRow is undefined, then the data for all rows is
		 *    returned. If mRow is defined, just data for that row, and is iCol is
		 *    defined, only data for the designated cell is returned.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    // Row data
		 *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('tr').click( function () {
		 *        var data = oTable.fnGetData( this );
		 *        // ... do something with the array / object of data for the row
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Individual cell data
		 *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('td').click( function () {
		 *        var sData = oTable.fnGetData( this );
		 *        alert( 'The cell clicked on had the value of '+sData );
		 *      } );
		 *    } );
		 */
		this.fnGetData = function( src, col )
		{
			var api = this.api( true );
		
			if ( src !== undefined ) {
				var type = src.nodeName ? src.nodeName.toLowerCase() : '';
		
				return col !== undefined || type == 'td' || type == 'th' ?
					api.cell( src, col ).data() :
					api.row( src ).data() || null;
			}
		
			return api.data().toArray();
		};
		
		
		/**
		 * Get an array of the TR nodes that are used in the table's body. Note that you will
		 * typically want to use the '$' API method in preference to this as it is more
		 * flexible.
		 *  @param {int} [iRow] Optional row index for the TR element you want
		 *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
		 *    in the table's body, or iRow is defined, just the TR element requested.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the nodes from the table
		 *      var nNodes = oTable.fnGetNodes( );
		 *    } );
		 */
		this.fnGetNodes = function( iRow )
		{
			var api = this.api( true );
		
			return iRow !== undefined ?
				api.row( iRow ).node() :
				api.rows().nodes().flatten().toArray();
		};
		
		
		/**
		 * Get the array indexes of a particular cell from it's DOM element
		 * and column index including hidden columns
		 *  @param {node} node this can either be a TR, TD or TH in the table's body
		 *  @returns {int} If nNode is given as a TR, then a single index is returned, or
		 *    if given as a cell, an array of [row index, column index (visible),
		 *    column index (all)] is given.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example tbody td').click( function () {
		 *        // Get the position of the current data from the node
		 *        var aPos = oTable.fnGetPosition( this );
		 *
		 *        // Get the data array for this row
		 *        var aData = oTable.fnGetData( aPos[0] );
		 *
		 *        // Update the data array and return the value
		 *        aData[ aPos[1] ] = 'clicked';
		 *        this.innerHTML = 'clicked';
		 *      } );
		 *
		 *      // Init DataTables
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnGetPosition = function( node )
		{
			var api = this.api( true );
			var nodeName = node.nodeName.toUpperCase();
		
			if ( nodeName == 'TR' ) {
				return api.row( node ).index();
			}
			else if ( nodeName == 'TD' || nodeName == 'TH' ) {
				var cell = api.cell( node ).index();
		
				return [
					cell.row,
					cell.columnVisible,
					cell.column
				];
			}
			return null;
		};
		
		
		/**
		 * Check to see if a row is 'open' or not.
		 *  @param {node} nTr the table row to check
		 *  @returns {boolean} true if the row is currently open, false otherwise
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnIsOpen = function( nTr )
		{
			return this.api( true ).row( nTr ).child.isShown();
		};
		
		
		/**
		 * This function will place a new row directly after a row which is currently
		 * on display on the page, with the HTML contents that is passed into the
		 * function. This can be used, for example, to ask for confirmation that a
		 * particular record should be deleted.
		 *  @param {node} nTr The table row to 'open'
		 *  @param {string|node|jQuery} mHtml The HTML to put into the row
		 *  @param {string} sClass Class to give the new TD cell
		 *  @returns {node} The row opened. Note that if the table row passed in as the
		 *    first parameter, is not found in the table, this method will silently
		 *    return.
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnOpen = function( nTr, mHtml, sClass )
		{
			return this.api( true )
				.row( nTr )
				.child( mHtml, sClass )
				.show()
				.child()[0];
		};
		
		
		/**
		 * Change the pagination - provides the internal logic for pagination in a simple API
		 * function. With this function you can have a DataTables table go to the next,
		 * previous, first or last pages.
		 *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
		 *    or page number to jump to (integer), note that page 0 is the first page.
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnPageChange( 'next' );
		 *    } );
		 */
		this.fnPageChange = function ( mAction, bRedraw )
		{
			var api = this.api( true ).page( mAction );
		
			if ( bRedraw === undefined || bRedraw ) {
				api.draw(false);
			}
		};
		
		
		/**
		 * Show a particular column
		 *  @param {int} iCol The column whose display should be changed
		 *  @param {bool} bShow Show (true) or hide (false) the column
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Hide the second column after initialisation
		 *      oTable.fnSetColumnVis( 1, false );
		 *    } );
		 */
		this.fnSetColumnVis = function ( iCol, bShow, bRedraw )
		{
			var api = this.api( true ).column( iCol ).visible( bShow );
		
			if ( bRedraw === undefined || bRedraw ) {
				api.columns.adjust().draw();
			}
		};
		
		
		/**
		 * Get the settings for a particular table for external manipulation
		 *  @returns {object} DataTables settings object. See
		 *    {@link DataTable.models.oSettings}
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      var oSettings = oTable.fnSettings();
		 *
		 *      // Show an example parameter from the settings
		 *      alert( oSettings._iDisplayStart );
		 *    } );
		 */
		this.fnSettings = function()
		{
			return _fnSettingsFromNode( this[_ext.iApiIndex] );
		};
		
		
		/**
		 * Sort the table by a particular column
		 *  @param {int} iCol the data index to sort on. Note that this will not match the
		 *    'display index' if you have hidden data entries
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sort immediately with columns 0 and 1
		 *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
		 *    } );
		 */
		this.fnSort = function( aaSort )
		{
			this.api( true ).order( aaSort ).draw();
		};
		
		
		/**
		 * Attach a sort listener to an element for a given column
		 *  @param {node} nNode the element to attach the sort listener to
		 *  @param {int} iColumn the column that a click on this node will sort on
		 *  @param {function} [fnCallback] callback function when sort is run
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sort on column 1, when 'sorter' is clicked on
		 *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
		 *    } );
		 */
		this.fnSortListener = function( nNode, iColumn, fnCallback )
		{
			this.api( true ).order.listener( nNode, iColumn, fnCallback );
		};
		
		
		/**
		 * Update a table cell or row - this method will accept either a single value to
		 * update the cell with, an array of values with one element for each column or
		 * an object in the same format as the original data source. The function is
		 * self-referencing in order to make the multi column updates easier.
		 *  @param {object|array|string} mData Data to update the cell/row with
		 *  @param {node|int} mRow TR element you want to update or the aoData index
		 *  @param {int} [iColumn] The column to update, give as null or undefined to
		 *    update a whole row.
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @param {bool} [bAction=true] Perform pre-draw actions or not
		 *  @returns {int} 0 on success, 1 on error
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
		 *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], $('tbody tr')[0] ); // Row
		 *    } );
		 */
		this.fnUpdate = function( mData, mRow, iColumn, bRedraw, bAction )
		{
			var api = this.api( true );
		
			if ( iColumn === undefined || iColumn === null ) {
				api.row( mRow ).data( mData );
			}
			else {
				api.cell( mRow, iColumn ).data( mData );
			}
		
			if ( bAction === undefined || bAction ) {
				api.columns.adjust();
			}
		
			if ( bRedraw === undefined || bRedraw ) {
				api.draw();
			}
			return 0;
		};
		
		
		/**
		 * Provide a common method for plug-ins to check the version of DataTables being used, in order
		 * to ensure compatibility.
		 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
		 *    formats "X" and "X.Y" are also acceptable.
		 *  @returns {boolean} true if this version of DataTables is greater or equal to the required
		 *    version, or false if this version of DataTales is not suitable
		 *  @method
		 *  @dtopt API
		 *  @deprecated Since v1.10
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
		 *    } );
		 */
		this.fnVersionCheck = _ext.fnVersionCheck;
		

		var _that = this;
		var emptyInit = options === undefined;
		var len = this.length;

		if ( emptyInit ) {
			options = {};
		}

		this.oApi = this.internal = _ext.internal;

		// Extend with old style plug-in API methods
		for ( var fn in DataTable.ext.internal ) {
			if ( fn ) {
				this[fn] = _fnExternApiFunc(fn);
			}
		}

		this.each(function() {
			// For each initialisation we want to give it a clean initialisation
			// object that can be bashed around
			var o = {};
			var oInit = len > 1 ? // optimisation for single table case
				_fnExtend( o, options, true ) :
				options;

			/*global oInit,_that,emptyInit*/
			var i=0, iLen, j, jLen, k, kLen;
			var sId = this.getAttribute( 'id' );
			var bInitHandedOff = false;
			var defaults = DataTable.defaults;
			var $this = $(this);
			
			
			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( null, 0, 'Non-table node initialisation ('+this.nodeName+')', 2 );
				return;
			}
			
			/* Backwards compatibility for the defaults */
			_fnCompatOpts( defaults );
			_fnCompatCols( defaults.column );
			
			/* Convert the camel-case defaults to Hungarian */
			_fnCamelToHungarian( defaults, defaults, true );
			_fnCamelToHungarian( defaults.column, defaults.column, true );
			
			/* Setting up the initialisation object */
			_fnCamelToHungarian( defaults, $.extend( oInit, $this.data() ), true );
			
			
			
			/* Check to see if we are re-initialising a table */
			var allSettings = DataTable.settings;
			for ( i=0, iLen=allSettings.length ; i<iLen ; i++ )
			{
				var s = allSettings[i];
			
				/* Base check on table node */
				if (
					s.nTable == this ||
					(s.nTHead && s.nTHead.parentNode == this) ||
					(s.nTFoot && s.nTFoot.parentNode == this)
				) {
					var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
					var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;
			
					if ( emptyInit || bRetrieve )
					{
						return s.oInstance;
					}
					else if ( bDestroy )
					{
						s.oInstance.fnDestroy();
						break;
					}
					else
					{
						_fnLog( s, 0, 'Cannot reinitialise DataTable', 3 );
						return;
					}
				}
			
				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( s.sTableId == this.id )
				{
					allSettings.splice( i, 1 );
					break;
				}
			}
			
			/* Ensure the table has an ID - required for accessibility */
			if ( sId === null || sId === "" )
			{
				sId = "DataTables_Table_"+(DataTable.ext._unique++);
				this.id = sId;
			}
			
			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
				"sDestroyWidth": $this[0].style.width,
				"sInstance":     sId,
				"sTableId":      sId
			} );
			oSettings.nTable = this;
			oSettings.oApi   = _that.internal;
			oSettings.oInit  = oInit;
			
			allSettings.push( oSettings );
			
			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length===1) ? _that : $this.dataTable();
			
			// Backwards compatibility, before we apply all the defaults
			_fnCompatOpts( oInit );
			_fnLanguageCompat( oInit.oLanguage );
			
			// If the length menu is given, but the init display length is not, use the length menu
			if ( oInit.aLengthMenu && ! oInit.iDisplayLength )
			{
				oInit.iDisplayLength = Array.isArray( oInit.aLengthMenu[0] ) ?
					oInit.aLengthMenu[0][0] : oInit.aLengthMenu[0];
			}
			
			// Apply the defaults and init options to make a single init object will all
			// options defined from defaults and instance options.
			oInit = _fnExtend( $.extend( true, {}, defaults ), oInit );
			
			
			// Map the initialisation options onto the settings object
			_fnMap( oSettings.oFeatures, oInit, [
				"bPaginate",
				"bLengthChange",
				"bFilter",
				"bSort",
				"bSortMulti",
				"bInfo",
				"bProcessing",
				"bAutoWidth",
				"bSortClasses",
				"bServerSide",
				"bDeferRender"
			] );
			_fnMap( oSettings, oInit, [
				"asStripeClasses",
				"ajax",
				"fnServerData",
				"fnFormatNumber",
				"sServerMethod",
				"aaSorting",
				"aaSortingFixed",
				"aLengthMenu",
				"sPaginationType",
				"sAjaxSource",
				"sAjaxDataProp",
				"iStateDuration",
				"sDom",
				"bSortCellsTop",
				"iTabIndex",
				"fnStateLoadCallback",
				"fnStateSaveCallback",
				"renderer",
				"searchDelay",
				"rowId",
				[ "iCookieDuration", "iStateDuration" ], // backwards compat
				[ "oSearch", "oPreviousSearch" ],
				[ "aoSearchCols", "aoPreSearchCols" ],
				[ "iDisplayLength", "_iDisplayLength" ]
			] );
			_fnMap( oSettings.oScroll, oInit, [
				[ "sScrollX", "sX" ],
				[ "sScrollXInner", "sXInner" ],
				[ "sScrollY", "sY" ],
				[ "bScrollCollapse", "bCollapse" ]
			] );
			_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
			
			/* Callback functions which are array driven */
			_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback,      'user' );
			_fnCallbackReg( oSettings, 'aoServerParams',       oInit.fnServerParams,      'user' );
			_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams,   'user' );
			_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams,   'user' );
			_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded,       'user' );
			_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback,       'user' );
			_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow,        'user' );
			_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback,    'user' );
			_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback,    'user' );
			_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete,      'user' );
			_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback,   'user' );
			
			oSettings.rowIdFn = _fnGetObjectDataFn( oInit.rowId );
			
			/* Browser support detection */
			_fnBrowserDetect( oSettings );
			
			var oClasses = oSettings.oClasses;
			
			$.extend( oClasses, DataTable.ext.classes, oInit.oClasses );
			$this.addClass( oClasses.sTable );
			
			
			if ( oSettings.iInitDisplayStart === undefined )
			{
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}
			
			if ( oInit.iDeferLoading !== null )
			{
				oSettings.bDeferLoading = true;
				var tmp = Array.isArray( oInit.iDeferLoading );
				oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
				oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
			}
			
			/* Language definitions */
			var oLanguage = oSettings.oLanguage;
			$.extend( true, oLanguage, oInit.oLanguage );
			
			if ( oLanguage.sUrl )
			{
				/* Get the language definitions from a file - because this Ajax call makes the language
				 * get async to the remainder of this function we use bInitHandedOff to indicate that
				 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
				 */
				$.ajax( {
					dataType: 'json',
					url: oLanguage.sUrl,
					success: function ( json ) {
						_fnLanguageCompat( json );
						_fnCamelToHungarian( defaults.oLanguage, json );
						$.extend( true, oLanguage, json );
			
						_fnCallbackFire( oSettings, null, 'i18n', [oSettings]);
						_fnInitialise( oSettings );
					},
					error: function () {
						// Error occurred loading language file, continue on as best we can
						_fnInitialise( oSettings );
					}
				} );
				bInitHandedOff = true;
			}
			else {
				_fnCallbackFire( oSettings, null, 'i18n', [oSettings]);
			}
			
			/*
			 * Stripes
			 */
			if ( oInit.asStripeClasses === null )
			{
				oSettings.asStripeClasses =[
					oClasses.sStripeOdd,
					oClasses.sStripeEven
				];
			}
			
			/* Remove row stripe classes if they are already on the table row */
			var stripeClasses = oSettings.asStripeClasses;
			var rowOne = $this.children('tbody').find('tr').eq(0);
			if ( $.inArray( true, $.map( stripeClasses, function(el, i) {
				return rowOne.hasClass(el);
			} ) ) !== -1 ) {
				$('tbody tr', this).removeClass( stripeClasses.join(' ') );
				oSettings.asDestroyStripes = stripeClasses.slice();
			}
			
			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var anThs = [];
			var aoColumnsInit;
			var nThead = this.getElementsByTagName('thead');
			if ( nThead.length !== 0 )
			{
				_fnDetectHeader( oSettings.aoHeader, nThead[0] );
				anThs = _fnGetUniqueThs( oSettings );
			}
			
			/* If not given a column array, generate one with nulls */
			if ( oInit.aoColumns === null )
			{
				aoColumnsInit = [];
				for ( i=0, iLen=anThs.length ; i<iLen ; i++ )
				{
					aoColumnsInit.push( null );
				}
			}
			else
			{
				aoColumnsInit = oInit.aoColumns;
			}
			
			/* Add the columns */
			for ( i=0, iLen=aoColumnsInit.length ; i<iLen ; i++ )
			{
				_fnAddColumn( oSettings, anThs ? anThs[i] : null );
			}
			
			/* Apply the column definitions */
			_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, aoColumnsInit, function (iCol, oDef) {
				_fnColumnOptions( oSettings, iCol, oDef );
			} );
			
			/* HTML5 attribute detection - build an mData object automatically if the
			 * attributes are found
			 */
			if ( rowOne.length ) {
				var a = function ( cell, name ) {
					return cell.getAttribute( 'data-'+name ) !== null ? name : null;
				};
			
				$( rowOne[0] ).children('th, td').each( function (i, cell) {
					var col = oSettings.aoColumns[i];
			
					if ( col.mData === i ) {
						var sort = a( cell, 'sort' ) || a( cell, 'order' );
						var filter = a( cell, 'filter' ) || a( cell, 'search' );
			
						if ( sort !== null || filter !== null ) {
							col.mData = {
								_:      i+'.display',
								sort:   sort !== null   ? i+'.@data-'+sort   : undefined,
								type:   sort !== null   ? i+'.@data-'+sort   : undefined,
								filter: filter !== null ? i+'.@data-'+filter : undefined
							};
			
							_fnColumnOptions( oSettings, i );
						}
					}
				} );
			}
			
			var features = oSettings.oFeatures;
			var loadedInit = function () {
				/*
				 * Sorting
				 * @todo For modularisation (1.11) this needs to do into a sort start up handler
				 */
			
				// If aaSorting is not defined, then we use the first indicator in asSorting
				// in case that has been altered, so the default sort reflects that option
				if ( oInit.aaSorting === undefined ) {
					var sorting = oSettings.aaSorting;
					for ( i=0, iLen=sorting.length ; i<iLen ; i++ ) {
						sorting[i][1] = oSettings.aoColumns[ i ].asSorting[0];
					}
				}
			
				/* Do a first pass on the sorting classes (allows any size changes to be taken into
				 * account, and also will apply sorting disabled classes if disabled
				 */
				_fnSortingClasses( oSettings );
			
				if ( features.bSort ) {
					_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
						if ( oSettings.bSorted ) {
							var aSort = _fnSortFlatten( oSettings );
							var sortedColumns = {};
			
							$.each( aSort, function (i, val) {
								sortedColumns[ val.src ] = val.dir;
							} );
			
							_fnCallbackFire( oSettings, null, 'order', [oSettings, aSort, sortedColumns] );
							_fnSortAria( oSettings );
						}
					} );
				}
			
				_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
					if ( oSettings.bSorted || _fnDataSource( oSettings ) === 'ssp' || features.bDeferRender ) {
						_fnSortingClasses( oSettings );
					}
				}, 'sc' );
			
			
				/*
				 * Final init
				 * Cache the header, body and footer as required, creating them if needed
				 */
			
				// Work around for Webkit bug 83867 - store the caption-side before removing from doc
				var captions = $this.children('caption').each( function () {
					this._captionSide = $(this).css('caption-side');
				} );
			
				var thead = $this.children('thead');
				if ( thead.length === 0 ) {
					thead = $('<thead/>').appendTo($this);
				}
				oSettings.nTHead = thead[0];
			
				var tbody = $this.children('tbody');
				if ( tbody.length === 0 ) {
					tbody = $('<tbody/>').insertAfter(thead);
				}
				oSettings.nTBody = tbody[0];
			
				var tfoot = $this.children('tfoot');
				if ( tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "") ) {
					// If we are a scrolling table, and no footer has been given, then we need to create
					// a tfoot element for the caption element to be appended to
					tfoot = $('<tfoot/>').appendTo($this);
				}
			
				if ( tfoot.length === 0 || tfoot.children().length === 0 ) {
					$this.addClass( oClasses.sNoFooter );
				}
				else if ( tfoot.length > 0 ) {
					oSettings.nTFoot = tfoot[0];
					_fnDetectHeader( oSettings.aoFooter, oSettings.nTFoot );
				}
			
				/* Check if there is data passing into the constructor */
				if ( oInit.aaData ) {
					for ( i=0 ; i<oInit.aaData.length ; i++ ) {
						_fnAddData( oSettings, oInit.aaData[ i ] );
					}
				}
				else if ( oSettings.bDeferLoading || _fnDataSource( oSettings ) == 'dom' ) {
					/* Grab the data from the page - only do this when deferred loading or no Ajax
					 * source since there is no point in reading the DOM data if we are then going
					 * to replace it with Ajax data
					 */
					_fnAddTr( oSettings, $(oSettings.nTBody).children('tr') );
				}
			
				/* Copy the data index array */
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
				/* Initialisation complete - table can be drawn */
				oSettings.bInitialised = true;
			
				/* Check if we need to initialise the table (it might not have been handed off to the
				 * language processor)
				 */
				if ( bInitHandedOff === false ) {
					_fnInitialise( oSettings );
				}
			};
			
			/* Must be done after everything which can be overridden by the state saving! */
			if ( oInit.bStateSave )
			{
				features.bStateSave = true;
				_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState, 'state_save' );
				_fnLoadState( oSettings, oInit, loadedInit );
			}
			else {
				loadedInit();
			}
			
		} );
		_that = null;
		return this;
	};

	
	/*
	 * It is useful to have variables which are scoped locally so only the
	 * DataTables functions can access them and they don't leak into global space.
	 * At the same time these functions are often useful over multiple files in the
	 * core and API, so we list, or at least document, all variables which are used
	 * by DataTables as private variables here. This also ensures that there is no
	 * clashing of variable names and that they can easily referenced for reuse.
	 */
	
	
	// Defined else where
	//  _selector_run
	//  _selector_opts
	//  _selector_first
	//  _selector_row_indexes
	
	var _ext; // DataTable.ext
	var _Api; // DataTable.Api
	var _api_register; // DataTable.Api.register
	var _api_registerPlural; // DataTable.Api.registerPlural
	
	var _re_dic = {};
	var _re_new_lines = /[\r\n\u2028]/g;
	var _re_html = /<.*?>/g;
	
	// This is not strict ISO8601 - Date.parse() is quite lax, although
	// implementations differ between browsers.
	var _re_date = /^\d{2,4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,2}([T ]{1}\d{1,2}[:\.]\d{2}([\.:]\d{2})?)?$/;
	
	// Escape regular expression special characters
	var _re_escape_regex = new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );
	
	// http://en.wikipedia.org/wiki/Foreign_exchange_market
	// - \u20BD - Russian ruble.
	// - \u20a9 - South Korean Won
	// - \u20BA - Turkish Lira
	// - \u20B9 - Indian Rupee
	// - R - Brazil (R$) and South Africa
	// - fr - Swiss Franc
	// - kr - Swedish krona, Norwegian krone and Danish krone
	// - \u2009 is thin space and \u202F is narrow no-break space, both used in many
	// - Ƀ - Bitcoin
	// - Ξ - Ethereum
	//   standards as thousands separators.
	var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;
	
	
	var _empty = function ( d ) {
		return !d || d === true || d === '-' ? true : false;
	};
	
	
	var _intVal = function ( s ) {
		var integer = parseInt( s, 10 );
		return !isNaN(integer) && isFinite(s) ? integer : null;
	};
	
	// Convert from a formatted number with characters other than `.` as the
	// decimal place, to a Javascript number
	var _numToDecimal = function ( num, decimalPoint ) {
		// Cache created regular expressions for speed as this function is called often
		if ( ! _re_dic[ decimalPoint ] ) {
			_re_dic[ decimalPoint ] = new RegExp( _fnEscapeRegex( decimalPoint ), 'g' );
		}
		return typeof num === 'string' && decimalPoint !== '.' ?
			num.replace( /\./g, '' ).replace( _re_dic[ decimalPoint ], '.' ) :
			num;
	};
	
	
	var _isNumber = function ( d, decimalPoint, formatted ) {
		var strType = typeof d === 'string';
	
		// If empty return immediately so there must be a number if it is a
		// formatted string (this stops the string "k", or "kr", etc being detected
		// as a formatted number for currency
		if ( _empty( d ) ) {
			return true;
		}
	
		if ( decimalPoint && strType ) {
			d = _numToDecimal( d, decimalPoint );
		}
	
		if ( formatted && strType ) {
			d = d.replace( _re_formatted_numeric, '' );
		}
	
		return !isNaN( parseFloat(d) ) && isFinite( d );
	};
	
	
	// A string without HTML in it can be considered to be HTML still
	var _isHtml = function ( d ) {
		return _empty( d ) || typeof d === 'string';
	};
	
	
	var _htmlNumeric = function ( d, decimalPoint, formatted ) {
		if ( _empty( d ) ) {
			return true;
		}
	
		var html = _isHtml( d );
		return ! html ?
			null :
			_isNumber( _stripHtml( d ), decimalPoint, formatted ) ?
				true :
				null;
	};
	
	
	var _pluck = function ( a, prop, prop2 ) {
		var out = [];
		var i=0, ien=a.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[i] && a[i][ prop ] ) {
					out.push( a[i][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[i] ) {
					out.push( a[i][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	// Basically the same as _pluck, but rather than looping over `a` we use `order`
	// as the indexes to pick from `a`
	var _pluck_order = function ( a, order, prop, prop2 )
	{
		var out = [];
		var i=0, ien=order.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ][ prop ] ) {
					out.push( a[ order[i] ][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				out.push( a[ order[i] ][ prop ] );
			}
		}
	
		return out;
	};
	
	
	var _range = function ( len, start )
	{
		var out = [];
		var end;
	
		if ( start === undefined ) {
			start = 0;
			end = len;
		}
		else {
			end = start;
			start = len;
		}
	
		for ( var i=start ; i<end ; i++ ) {
			out.push( i );
		}
	
		return out;
	};
	
	
	var _removeEmpty = function ( a )
	{
		var out = [];
	
		for ( var i=0, ien=a.length ; i<ien ; i++ ) {
			if ( a[i] ) { // careful - will remove all falsy values!
				out.push( a[i] );
			}
		}
	
		return out;
	};
	
	
	var _stripHtml = function ( d ) {
		return d.replace( _re_html, '' );
	};
	
	
	/**
	 * Determine if all values in the array are unique. This means we can short
	 * cut the _unique method at the cost of a single loop. A sorted array is used
	 * to easily check the values.
	 *
	 * @param  {array} src Source array
	 * @return {boolean} true if all unique, false otherwise
	 * @ignore
	 */
	var _areAllUnique = function ( src ) {
		if ( src.length < 2 ) {
			return true;
		}
	
		var sorted = src.slice().sort();
		var last = sorted[0];
	
		for ( var i=1, ien=sorted.length ; i<ien ; i++ ) {
			if ( sorted[i] === last ) {
				return false;
			}
	
			last = sorted[i];
		}
	
		return true;
	};
	
	
	/**
	 * Find the unique elements in a source array.
	 *
	 * @param  {array} src Source array
	 * @return {array} Array of unique items
	 * @ignore
	 */
	var _unique = function ( src )
	{
		if ( _areAllUnique( src ) ) {
			return src.slice();
		}
	
		// A faster unique method is to use object keys to identify used values,
		// but this doesn't work with arrays or objects, which we must also
		// consider. See jsperf.com/compare-array-unique-versions/4 for more
		// information.
		var
			out = [],
			val,
			i, ien=src.length,
			j, k=0;
	
		again: for ( i=0 ; i<ien ; i++ ) {
			val = src[i];
	
			for ( j=0 ; j<k ; j++ ) {
				if ( out[j] === val ) {
					continue again;
				}
			}
	
			out.push( val );
			k++;
		}
	
		return out;
	};
	
	// Surprisingly this is faster than [].concat.apply
	// https://jsperf.com/flatten-an-array-loop-vs-reduce/2
	var _flatten = function (out, val) {
		if (Array.isArray(val)) {
			for (var i=0 ; i<val.length ; i++) {
				_flatten(out, val[i]);
			}
		}
		else {
			out.push(val);
		}
	  
		return out;
	}
	
	// Array.isArray polyfill.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
	if (! Array.isArray) {
	    Array.isArray = function(arg) {
	        return Object.prototype.toString.call(arg) === '[object Array]';
	    };
	}
	
	// .trim() polyfill
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
	if (!String.prototype.trim) {
	  String.prototype.trim = function () {
	    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	  };
	}
	
	/**
	 * DataTables utility methods
	 * 
	 * This namespace provides helper methods that DataTables uses internally to
	 * create a DataTable, but which are not exclusively used only for DataTables.
	 * These methods can be used by extension authors to save the duplication of
	 * code.
	 *
	 *  @namespace
	 */
	DataTable.util = {
		/**
		 * Throttle the calls to a function. Arguments and context are maintained
		 * for the throttled function.
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		throttle: function ( fn, freq ) {
			var
				frequency = freq !== undefined ? freq : 200,
				last,
				timer;
	
			return function () {
				var
					that = this,
					now  = +new Date(),
					args = arguments;
	
				if ( last && now < last + frequency ) {
					clearTimeout( timer );
	
					timer = setTimeout( function () {
						last = undefined;
						fn.apply( that, args );
					}, frequency );
				}
				else {
					last = now;
					fn.apply( that, args );
				}
			};
		},
	
	
		/**
		 * Escape a string such that it can be used in a regular expression
		 *
		 *  @param {string} val string to escape
		 *  @returns {string} escaped string
		 */
		escapeRegex: function ( val ) {
			return val.replace( _re_escape_regex, '\\$1' );
		}
	};
	
	
	
	/**
	 * Create a mapping object that allows camel case parameters to be looked up
	 * for their Hungarian counterparts. The mapping is stored in a private
	 * parameter called `_hungarianMap` which can be accessed on the source object.
	 *  @param {object} o
	 *  @memberof DataTable#oApi
	 */
	function _fnHungarianMap ( o )
	{
		var
			hungarian = 'a aa ai ao as b fn i m o s ',
			match,
			newKey,
			map = {};
	
		$.each( o, function (key, val) {
			match = key.match(/^([^A-Z]+?)([A-Z])/);
	
			if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
			{
				newKey = key.replace( match[0], match[2].toLowerCase() );
				map[ newKey ] = key;
	
				if ( match[1] === 'o' )
				{
					_fnHungarianMap( o[key] );
				}
			}
		} );
	
		o._hungarianMap = map;
	}
	
	
	/**
	 * Convert from camel case parameters to Hungarian, based on a Hungarian map
	 * created by _fnHungarianMap.
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 *  @memberof DataTable#oApi
	 */
	function _fnCamelToHungarian ( src, user, force )
	{
		if ( ! src._hungarianMap ) {
			_fnHungarianMap( src );
		}
	
		var hungarianKey;
	
		$.each( user, function (key, val) {
			hungarianKey = src._hungarianMap[ key ];
	
			if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
			{
				// For objects, we need to buzz down into the object to copy parameters
				if ( hungarianKey.charAt(0) === 'o' )
				{
					// Copy the camelCase options over to the hungarian
					if ( ! user[ hungarianKey ] ) {
						user[ hungarianKey ] = {};
					}
					$.extend( true, user[hungarianKey], user[key] );
	
					_fnCamelToHungarian( src[hungarianKey], user[hungarianKey], force );
				}
				else {
					user[hungarianKey] = user[ key ];
				}
			}
		} );
	}
	
	
	/**
	 * Language compatibility - when certain options are given, and others aren't, we
	 * need to duplicate the values over, in order to provide backwards compatibility
	 * with older language files.
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnLanguageCompat( lang )
	{
		// Note the use of the Hungarian notation for the parameters in this method as
		// this is called after the mapping of camelCase to Hungarian
		var defaults = DataTable.defaults.oLanguage;
	
		// Default mapping
		var defaultDecimal = defaults.sDecimal;
		if ( defaultDecimal ) {
			_addNumericSort( defaultDecimal );
		}
	
		if ( lang ) {
			var zeroRecords = lang.sZeroRecords;
	
			// Backwards compatibility - if there is no sEmptyTable given, then use the same as
			// sZeroRecords - assuming that is given.
			if ( ! lang.sEmptyTable && zeroRecords &&
				defaults.sEmptyTable === "No data available in table" )
			{
				_fnMap( lang, lang, 'sZeroRecords', 'sEmptyTable' );
			}
	
			// Likewise with loading records
			if ( ! lang.sLoadingRecords && zeroRecords &&
				defaults.sLoadingRecords === "Loading..." )
			{
				_fnMap( lang, lang, 'sZeroRecords', 'sLoadingRecords' );
			}
	
			// Old parameter name of the thousands separator mapped onto the new
			if ( lang.sInfoThousands ) {
				lang.sThousands = lang.sInfoThousands;
			}
	
			var decimal = lang.sDecimal;
			if ( decimal && defaultDecimal !== decimal ) {
				_addNumericSort( decimal );
			}
		}
	}
	
	
	/**
	 * Map one parameter onto another
	 *  @param {object} o Object to map
	 *  @param {*} knew The new parameter name
	 *  @param {*} old The old parameter name
	 */
	var _fnCompatMap = function ( o, knew, old ) {
		if ( o[ knew ] !== undefined ) {
			o[ old ] = o[ knew ];
		}
	};
	
	
	/**
	 * Provide backwards compatibility for the main DT options. Note that the new
	 * options are mapped onto the old parameters, so this is an external interface
	 * change only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatOpts ( init )
	{
		_fnCompatMap( init, 'ordering',      'bSort' );
		_fnCompatMap( init, 'orderMulti',    'bSortMulti' );
		_fnCompatMap( init, 'orderClasses',  'bSortClasses' );
		_fnCompatMap( init, 'orderCellsTop', 'bSortCellsTop' );
		_fnCompatMap( init, 'order',         'aaSorting' );
		_fnCompatMap( init, 'orderFixed',    'aaSortingFixed' );
		_fnCompatMap( init, 'paging',        'bPaginate' );
		_fnCompatMap( init, 'pagingType',    'sPaginationType' );
		_fnCompatMap( init, 'pageLength',    'iDisplayLength' );
		_fnCompatMap( init, 'searching',     'bFilter' );
	
		// Boolean initialisation of x-scrolling
		if ( typeof init.sScrollX === 'boolean' ) {
			init.sScrollX = init.sScrollX ? '100%' : '';
		}
		if ( typeof init.scrollX === 'boolean' ) {
			init.scrollX = init.scrollX ? '100%' : '';
		}
	
		// Column search objects are in an array, so it needs to be converted
		// element by element
		var searchCols = init.aoSearchCols;
	
		if ( searchCols ) {
			for ( var i=0, ien=searchCols.length ; i<ien ; i++ ) {
				if ( searchCols[i] ) {
					_fnCamelToHungarian( DataTable.models.oSearch, searchCols[i] );
				}
			}
		}
	}
	
	
	/**
	 * Provide backwards compatibility for column options. Note that the new options
	 * are mapped onto the old parameters, so this is an external interface change
	 * only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatCols ( init )
	{
		_fnCompatMap( init, 'orderable',     'bSortable' );
		_fnCompatMap( init, 'orderData',     'aDataSort' );
		_fnCompatMap( init, 'orderSequence', 'asSorting' );
		_fnCompatMap( init, 'orderDataType', 'sortDataType' );
	
		// orderData can be given as an integer
		var dataSort = init.aDataSort;
		if ( typeof dataSort === 'number' && ! Array.isArray( dataSort ) ) {
			init.aDataSort = [ dataSort ];
		}
	}
	
	
	/**
	 * Browser feature detection for capabilities, quirks
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBrowserDetect( settings )
	{
		// We don't need to do this every time DataTables is constructed, the values
		// calculated are specific to the browser and OS configuration which we
		// don't expect to change between initialisations
		if ( ! DataTable.__browser ) {
			var browser = {};
			DataTable.__browser = browser;
	
			// Scrolling feature / quirks detection
			var n = $('<div/>')
				.css( {
					position: 'fixed',
					top: 0,
					left: $(window).scrollLeft()*-1, // allow for scrolling
					height: 1,
					width: 1,
					overflow: 'hidden'
				} )
				.append(
					$('<div/>')
						.css( {
							position: 'absolute',
							top: 1,
							left: 1,
							width: 100,
							overflow: 'scroll'
						} )
						.append(
							$('<div/>')
								.css( {
									width: '100%',
									height: 10
								} )
						)
				)
				.appendTo( 'body' );
	
			var outer = n.children();
			var inner = outer.children();
	
			// Numbers below, in order, are:
			// inner.offsetWidth, inner.clientWidth, outer.offsetWidth, outer.clientWidth
			//
			// IE6 XP:                           100 100 100  83
			// IE7 Vista:                        100 100 100  83
			// IE 8+ Windows:                     83  83 100  83
			// Evergreen Windows:                 83  83 100  83
			// Evergreen Mac with scrollbars:     85  85 100  85
			// Evergreen Mac without scrollbars: 100 100 100 100
	
			// Get scrollbar width
			browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
	
			// IE6/7 will oversize a width 100% element inside a scrolling element, to
			// include the width of the scrollbar, while other browsers ensure the inner
			// element is contained without forcing scrolling
			browser.bScrollOversize = inner[0].offsetWidth === 100 && outer[0].clientWidth !== 100;
	
			// In rtl text layout, some browsers (most, but not all) will place the
			// scrollbar on the left, rather than the right.
			browser.bScrollbarLeft = Math.round( inner.offset().left ) !== 1;
	
			// IE8- don't provide height and width for getBoundingClientRect
			browser.bBounding = n[0].getBoundingClientRect().width ? true : false;
	
			n.remove();
		}
	
		$.extend( settings.oBrowser, DataTable.__browser );
		settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
	}
	
	
	/**
	 * Array.prototype reduce[Right] method, used for browsers which don't support
	 * JS 1.6. Done this way to reduce code size, since we iterate either way
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnReduce ( that, fn, init, start, end, inc )
	{
		var
			i = start,
			value,
			isSet = false;
	
		if ( init !== undefined ) {
			value = init;
			isSet = true;
		}
	
		while ( i !== end ) {
			if ( ! that.hasOwnProperty(i) ) {
				continue;
			}
	
			value = isSet ?
				fn( value, that[i], i, that ) :
				that[i];
	
			isSet = true;
			i += inc;
		}
	
		return value;
	}
	
	/**
	 * Add a column to the list used for the table with default values
	 *  @param {object} oSettings dataTables settings object
	 *  @param {node} nTh The th element for this column
	 *  @memberof DataTable#oApi
	 */
	function _fnAddColumn( oSettings, nTh )
	{
		// Add column to aoColumns array
		var oDefaults = DataTable.defaults.column;
		var iCol = oSettings.aoColumns.length;
		var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
			"nTh": nTh ? nTh : document.createElement('th'),
			"sTitle":    oDefaults.sTitle    ? oDefaults.sTitle    : nTh ? nTh.innerHTML : '',
			"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
			"mData": oDefaults.mData ? oDefaults.mData : iCol,
			idx: iCol
		} );
		oSettings.aoColumns.push( oCol );
	
		// Add search object for column specific search. Note that the `searchCols[ iCol ]`
		// passed into extend can be undefined. This allows the user to give a default
		// with only some of the parameters defined, and also not give a default
		var searchCols = oSettings.aoPreSearchCols;
		searchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch, searchCols[ iCol ] );
	
		// Use the default column options function to initialise classes etc
		_fnColumnOptions( oSettings, iCol, $(nTh).data() );
	}
	
	
	/**
	 * Apply options for a column
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iCol column index to consider
	 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnOptions( oSettings, iCol, oOptions )
	{
		var oCol = oSettings.aoColumns[ iCol ];
		var oClasses = oSettings.oClasses;
		var th = $(oCol.nTh);
	
		// Try to get width information from the DOM. We can't get it from CSS
		// as we'd need to parse the CSS stylesheet. `width` option can override
		if ( ! oCol.sWidthOrig ) {
			// Width attribute
			oCol.sWidthOrig = th.attr('width') || null;
	
			// Style attribute
			var t = (th.attr('style') || '').match(/width:\s*(\d+[pxem%]+)/);
			if ( t ) {
				oCol.sWidthOrig = t[1];
			}
		}
	
		/* User specified column options */
		if ( oOptions !== undefined && oOptions !== null )
		{
			// Backwards compatibility
			_fnCompatCols( oOptions );
	
			// Map camel case parameters to their Hungarian counterparts
			_fnCamelToHungarian( DataTable.defaults.column, oOptions, true );
	
			/* Backwards compatibility for mDataProp */
			if ( oOptions.mDataProp !== undefined && !oOptions.mData )
			{
				oOptions.mData = oOptions.mDataProp;
			}
	
			if ( oOptions.sType )
			{
				oCol._sManualType = oOptions.sType;
			}
	
			// `class` is a reserved word in Javascript, so we need to provide
			// the ability to use a valid name for the camel case input
			if ( oOptions.className && ! oOptions.sClass )
			{
				oOptions.sClass = oOptions.className;
			}
			if ( oOptions.sClass ) {
				th.addClass( oOptions.sClass );
			}
	
			$.extend( oCol, oOptions );
			_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
	
			/* iDataSort to be applied (backwards compatibility), but aDataSort will take
			 * priority if defined
			 */
			if ( oOptions.iDataSort !== undefined )
			{
				oCol.aDataSort = [ oOptions.iDataSort ];
			}
			_fnMap( oCol, oOptions, "aDataSort" );
		}
	
		/* Cache the data get and set functions for speed */
		var mDataSrc = oCol.mData;
		var mData = _fnGetObjectDataFn( mDataSrc );
		var mRender = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;
	
		var attrTest = function( src ) {
			return typeof src === 'string' && src.indexOf('@') !== -1;
		};
		oCol._bAttrSrc = $.isPlainObject( mDataSrc ) && (
			attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
		);
		oCol._setter = null;
	
		oCol.fnGetData = function (rowData, type, meta) {
			var innerData = mData( rowData, type, undefined, meta );
	
			return mRender && type ?
				mRender( innerData, type, rowData, meta ) :
				innerData;
		};
		oCol.fnSetData = function ( rowData, val, meta ) {
			return _fnSetObjectDataFn( mDataSrc )( rowData, val, meta );
		};
	
		// Indicate if DataTables should read DOM data as an object or array
		// Used in _fnGetRowElements
		if ( typeof mDataSrc !== 'number' ) {
			oSettings._rowReadObject = true;
		}
	
		/* Feature sorting overrides column specific when off */
		if ( !oSettings.oFeatures.bSort )
		{
			oCol.bSortable = false;
			th.addClass( oClasses.sSortableNone ); // Have to add class here as order event isn't called
		}
	
		/* Check that the class assignment is correct for sorting */
		var bAsc = $.inArray('asc', oCol.asSorting) !== -1;
		var bDesc = $.inArray('desc', oCol.asSorting) !== -1;
		if ( !oCol.bSortable || (!bAsc && !bDesc) )
		{
			oCol.sSortingClass = oClasses.sSortableNone;
			oCol.sSortingClassJUI = "";
		}
		else if ( bAsc && !bDesc )
		{
			oCol.sSortingClass = oClasses.sSortableAsc;
			oCol.sSortingClassJUI = oClasses.sSortJUIAscAllowed;
		}
		else if ( !bAsc && bDesc )
		{
			oCol.sSortingClass = oClasses.sSortableDesc;
			oCol.sSortingClassJUI = oClasses.sSortJUIDescAllowed;
		}
		else
		{
			oCol.sSortingClass = oClasses.sSortable;
			oCol.sSortingClassJUI = oClasses.sSortJUI;
		}
	}
	
	
	/**
	 * Adjust the table column widths for new data. Note: you would probably want to
	 * do a redraw after calling this function!
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAdjustColumnSizing ( settings )
	{
		/* Not interested in doing column width calculation if auto-width is disabled */
		if ( settings.oFeatures.bAutoWidth !== false )
		{
			var columns = settings.aoColumns;
	
			_fnCalculateColumnWidths( settings );
			for ( var i=0 , iLen=columns.length ; i<iLen ; i++ )
			{
				columns[i].nTh.style.width = columns[i].sWidth;
			}
		}
	
		var scroll = settings.oScroll;
		if ( scroll.sY !== '' || scroll.sX !== '')
		{
			_fnScrollDraw( settings );
		}
	
		_fnCallbackFire( settings, null, 'column-sizing', [settings] );
	}
	
	
	/**
	 * Covert the index of a visible column to the index in the data array (take account
	 * of hidden columns)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iMatch Visible column index to lookup
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnVisibleToColumnIndex( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
	
		return typeof aiVis[iMatch] === 'number' ?
			aiVis[iMatch] :
			null;
	}
	
	
	/**
	 * Covert the index of an index in the data array and convert it to the visible
	 *   column index (take account of hidden columns)
	 *  @param {int} iMatch Column index to lookup
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnIndexToVisible( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
		var iPos = $.inArray( iMatch, aiVis );
	
		return iPos !== -1 ? iPos : null;
	}
	
	
	/**
	 * Get the number of visible columns
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the number of visible columns
	 *  @memberof DataTable#oApi
	 */
	function _fnVisbleColumns( oSettings )
	{
		var vis = 0;
	
		// No reduce in IE8, use a loop for now
		$.each( oSettings.aoColumns, function ( i, col ) {
			if ( col.bVisible && $(col.nTh).css('display') !== 'none' ) {
				vis++;
			}
		} );
	
		return vis;
	}
	
	
	/**
	 * Get an array of column indexes that match a given property
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sParam Parameter in aoColumns to look for - typically
	 *    bVisible or bSearchable
	 *  @returns {array} Array of indexes with matched properties
	 *  @memberof DataTable#oApi
	 */
	function _fnGetColumns( oSettings, sParam )
	{
		var a = [];
	
		$.map( oSettings.aoColumns, function(val, i) {
			if ( val[sParam] ) {
				a.push( i );
			}
		} );
	
		return a;
	}
	
	
	/**
	 * Calculate the 'type' of a column
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnTypes ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var types = DataTable.ext.type.detect;
		var i, ien, j, jen, k, ken;
		var col, cell, detectedType, cache;
	
		// For each column, spin over the 
		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			col = columns[i];
			cache = [];
	
			if ( ! col.sType && col._sManualType ) {
				col.sType = col._sManualType;
			}
			else if ( ! col.sType ) {
				for ( j=0, jen=types.length ; j<jen ; j++ ) {
					for ( k=0, ken=data.length ; k<ken ; k++ ) {
						// Use a cache array so we only need to get the type data
						// from the formatter once (when using multiple detectors)
						if ( cache[k] === undefined ) {
							cache[k] = _fnGetCellData( settings, k, i, 'type' );
						}
	
						detectedType = types[j]( cache[k], settings );
	
						// If null, then this type can't apply to this column, so
						// rather than testing all cells, break out. There is an
						// exception for the last type which is `html`. We need to
						// scan all rows since it is possible to mix string and HTML
						// types
						if ( ! detectedType && j !== types.length-1 ) {
							break;
						}
	
						// Only a single match is needed for html type since it is
						// bottom of the pile and very similar to string - but it
						// must not be empty
						if ( detectedType === 'html' && ! _empty(cache[k]) ) {
							break;
						}
					}
	
					// Type is valid for all data points in the column - use this
					// type
					if ( detectedType ) {
						col.sType = detectedType;
						break;
					}
				}
	
				// Fall back - if no type was detected, always use string
				if ( ! col.sType ) {
					col.sType = 'string';
				}
			}
		}
	}
	
	
	/**
	 * Take the column definitions and static columns arrays and calculate how
	 * they relate to column indexes. The callback function will then apply the
	 * definition found for a column to a suitable configuration object.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
	 *  @param {array} aoCols The aoColumns array that defines columns individually
	 *  @param {function} fn Callback function - takes two parameters, the calculated
	 *    column index and the definition for that column.
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, fn )
	{
		var i, iLen, j, jLen, k, kLen, def;
		var columns = oSettings.aoColumns;
	
		// Column definitions with aTargets
		if ( aoColDefs )
		{
			/* Loop over the definitions array - loop in reverse so first instance has priority */
			for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
			{
				def = aoColDefs[i];
	
				/* Each definition can target multiple columns, as it is an array */
				var aTargets = def.targets !== undefined ?
					def.targets :
					def.aTargets;
	
				if ( ! Array.isArray( aTargets ) )
				{
					aTargets = [ aTargets ];
				}
	
				for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
				{
					if ( typeof aTargets[j] === 'number' && aTargets[j] >= 0 )
					{
						/* Add columns that we don't yet know about */
						while( columns.length <= aTargets[j] )
						{
							_fnAddColumn( oSettings );
						}
	
						/* Integer, basic index */
						fn( aTargets[j], def );
					}
					else if ( typeof aTargets[j] === 'number' && aTargets[j] < 0 )
					{
						/* Negative integer, right to left column counting */
						fn( columns.length+aTargets[j], def );
					}
					else if ( typeof aTargets[j] === 'string' )
					{
						/* Class name matching on TH element */
						for ( k=0, kLen=columns.length ; k<kLen ; k++ )
						{
							if ( aTargets[j] == "_all" ||
							     $(columns[k].nTh).hasClass( aTargets[j] ) )
							{
								fn( k, def );
							}
						}
					}
				}
			}
		}
	
		// Statically defined columns array
		if ( aoCols )
		{
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ )
			{
				fn( i, aoCols[i] );
			}
		}
	}
	
	/**
	 * Add a data array to the table, creating DOM node etc. This is the parallel to
	 * _fnGatherData, but for adding rows from a Javascript source, rather than a
	 * DOM source.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aData data array to be added
	 *  @param {node} [nTr] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
	 *  @memberof DataTable#oApi
	 */
	function _fnAddData ( oSettings, aDataIn, nTr, anTds )
	{
		/* Create the object for storing information about this new row */
		var iRow = oSettings.aoData.length;
		var oData = $.extend( true, {}, DataTable.models.oRow, {
			src: nTr ? 'dom' : 'data',
			idx: iRow
		} );
	
		oData._aData = aDataIn;
		oSettings.aoData.push( oData );
	
		/* Create the cells */
		var nTd, sThisType;
		var columns = oSettings.aoColumns;
	
		// Invalidate the column types as the new data needs to be revalidated
		for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
		{
			columns[i].sType = null;
		}
	
		/* Add to the display array */
		oSettings.aiDisplayMaster.push( iRow );
	
		var id = oSettings.rowIdFn( aDataIn );
		if ( id !== undefined ) {
			oSettings.aIds[ id ] = oData;
		}
	
		/* Create the DOM information, or register it if already present */
		if ( nTr || ! oSettings.oFeatures.bDeferRender )
		{
			_fnCreateTr( oSettings, iRow, nTr, anTds );
		}
	
		return iRow;
	}
	
	
	/**
	 * Add one or more TR elements to the table. Generally we'd expect to
	 * use this for reading data from a DOM sourced table, but it could be
	 * used for an TR element. Note that if a TR is given, it is used (i.e.
	 * it is not cloned).
	 *  @param {object} settings dataTables settings object
	 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
	 *  @returns {array} Array of indexes for the added rows
	 *  @memberof DataTable#oApi
	 */
	function _fnAddTr( settings, trs )
	{
		var row;
	
		// Allow an individual node to be passed in
		if ( ! (trs instanceof $) ) {
			trs = $(trs);
		}
	
		return trs.map( function (i, el) {
			row = _fnGetRowElements( settings, el );
			return _fnAddData( settings, row.data, el, row.cells );
		} );
	}
	
	
	/**
	 * Take a TR element and convert it to an index in aoData
	 *  @param {object} oSettings dataTables settings object
	 *  @param {node} n the TR element to find
	 *  @returns {int} index if the node is found, null if not
	 *  @memberof DataTable#oApi
	 */
	function _fnNodeToDataIndex( oSettings, n )
	{
		return (n._DT_RowIndex!==undefined) ? n._DT_RowIndex : null;
	}
	
	
	/**
	 * Take a TD element and convert it into a column data index (not the visible index)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iRow The row number the TD/TH can be found in
	 *  @param {node} n The TD/TH element to find
	 *  @returns {int} index if the node is found, -1 if not
	 *  @memberof DataTable#oApi
	 */
	function _fnNodeToColumnIndex( oSettings, iRow, n )
	{
		return $.inArray( n, oSettings.aoData[ iRow ].anCells );
	}
	
	
	/**
	 * Get the data for a given cell from the internal cache, taking into account data mapping
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {string} type data get type ('display', 'type' 'filter' 'sort')
	 *  @returns {*} Cell data
	 *  @memberof DataTable#oApi
	 */
	function _fnGetCellData( settings, rowIdx, colIdx, type )
	{
		var draw           = settings.iDraw;
		var col            = settings.aoColumns[colIdx];
		var rowData        = settings.aoData[rowIdx]._aData;
		var defaultContent = col.sDefaultContent;
		var cellData       = col.fnGetData( rowData, type, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		} );
	
		if ( cellData === undefined ) {
			if ( settings.iDrawError != draw && defaultContent === null ) {
				_fnLog( settings, 0, "Requested unknown parameter "+
					(typeof col.mData=='function' ? '{function}' : "'"+col.mData+"'")+
					" for row "+rowIdx+", column "+colIdx, 4 );
				settings.iDrawError = draw;
			}
			return defaultContent;
		}
	
		// When the data source is null and a specific data type is requested (i.e.
		// not the original data), we can use default column data
		if ( (cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined ) {
			cellData = defaultContent;
		}
		else if ( typeof cellData === 'function' ) {
			// If the data source is a function, then we run it and use the return,
			// executing in the scope of the data object (for instances)
			return cellData.call( rowData );
		}
	
		if ( cellData === null && type == 'display' ) {
			return '';
		}
		return cellData;
	}
	
	
	/**
	 * Set the value for a specific cell, into the internal data cache
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {*} val Value to set
	 *  @memberof DataTable#oApi
	 */
	function _fnSetCellData( settings, rowIdx, colIdx, val )
	{
		var col     = settings.aoColumns[colIdx];
		var rowData = settings.aoData[rowIdx]._aData;
	
		col.fnSetData( rowData, val, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		}  );
	}
	
	
	// Private variable that is used to match action syntax in the data property object
	var __reArray = /\[.*?\]$/;
	var __reFn = /\(\)$/;
	
	/**
	 * Split string on periods, taking into account escaped periods
	 * @param  {string} str String to split
	 * @return {array} Split string
	 */
	function _fnSplitObjNotation( str )
	{
		return $.map( str.match(/(\\.|[^\.])+/g) || [''], function ( s ) {
			return s.replace(/\\\./g, '.');
		} );
	}
	
	
	/**
	 * Return a function that can be used to get data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data get function
	 *  @memberof DataTable#oApi
	 */
	function _fnGetObjectDataFn( mSource )
	{
		if ( $.isPlainObject( mSource ) )
		{
			/* Build an object of get functions, and wrap them in a single call */
			var o = {};
			$.each( mSource, function (key, val) {
				if ( val ) {
					o[key] = _fnGetObjectDataFn( val );
				}
			} );
	
			return function (data, type, row, meta) {
				var t = o[type] || o._;
				return t !== undefined ?
					t(data, type, row, meta) :
					data;
			};
		}
		else if ( mSource === null )
		{
			/* Give an empty string for rendering / sorting etc */
			return function (data) { // type, row and meta also passed, but not used
				return data;
			};
		}
		else if ( typeof mSource === 'function' )
		{
			return function (data, type, row, meta) {
				return mSource( data, type, row, meta );
			};
		}
		else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
			      mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1) )
		{
			/* If there is a . in the source string then the data source is in a
			 * nested object so we loop over the data for each level to get the next
			 * level down. On each loop we test for undefined, and if found immediately
			 * return. This allows entire objects to be missing and sDefaultContent to
			 * be used if defined, rather than throwing an error
			 */
			var fetchData = function (data, type, src) {
				var arrayNotation, funcNotation, out, innerSrc;
	
				if ( src !== "" )
				{
					var a = _fnSplitObjNotation( src );
	
					for ( var i=0, iLen=a.length ; i<iLen ; i++ )
					{
						// Check if we are dealing with special notation
						arrayNotation = a[i].match(__reArray);
						funcNotation = a[i].match(__reFn);
	
						if ( arrayNotation )
						{
							// Array notation
							a[i] = a[i].replace(__reArray, '');
	
							// Condition allows simply [] to be passed in
							if ( a[i] !== "" ) {
								data = data[ a[i] ];
							}
							out = [];
	
							// Get the remainder of the nested object to get
							a.splice( 0, i+1 );
							innerSrc = a.join('.');
	
							// Traverse each entry in the array getting the properties requested
							if ( Array.isArray( data ) ) {
								for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
									out.push( fetchData( data[j], type, innerSrc ) );
								}
							}
	
							// If a string is given in between the array notation indicators, that
							// is used to join the strings together, otherwise an array is returned
							var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
							data = (join==="") ? out : out.join(join);
	
							// The inner call to fetchData has already traversed through the remainder
							// of the source requested, so we exit from the loop
							break;
						}
						else if ( funcNotation )
						{
							// Function call
							a[i] = a[i].replace(__reFn, '');
							data = data[ a[i] ]();
							continue;
						}
	
						if ( data === null || data[ a[i] ] === undefined )
						{
							return undefined;
						}
						data = data[ a[i] ];
					}
				}
	
				return data;
			};
	
			return function (data, type) { // row and meta also passed, but not used
				return fetchData( data, type, mSource );
			};
		}
		else
		{
			/* Array or flat object mapping */
			return function (data, type) { // row and meta also passed, but not used
				return data[mSource];
			};
		}
	}
	
	
	/**
	 * Return a function that can be used to set data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data set function
	 *  @memberof DataTable#oApi
	 */
	function _fnSetObjectDataFn( mSource )
	{
		if ( $.isPlainObject( mSource ) )
		{
			/* Unlike get, only the underscore (global) option is used for for
			 * setting data since we don't know the type here. This is why an object
			 * option is not documented for `mData` (which is read/write), but it is
			 * for `mRender` which is read only.
			 */
			return _fnSetObjectDataFn( mSource._ );
		}
		else if ( mSource === null )
		{
			/* Nothing to do when the data source is null */
			return function () {};
		}
		else if ( typeof mSource === 'function' )
		{
			return function (data, val, meta) {
				mSource( data, 'set', val, meta );
			};
		}
		else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
			      mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1) )
		{
			/* Like the get, we need to get data from a nested object */
			var setData = function (data, val, src) {
				var a = _fnSplitObjNotation( src ), b;
				var aLast = a[a.length-1];
				var arrayNotation, funcNotation, o, innerSrc;
	
				for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ )
				{
					// Protect against prototype pollution
					if (a[i] === '__proto__' || a[i] === 'constructor') {
						throw new Error('Cannot set prototype values');
					}
	
					// Check if we are dealing with an array notation request
					arrayNotation = a[i].match(__reArray);
					funcNotation = a[i].match(__reFn);
	
					if ( arrayNotation )
					{
						a[i] = a[i].replace(__reArray, '');
						data[ a[i] ] = [];
	
						// Get the remainder of the nested object to set so we can recurse
						b = a.slice();
						b.splice( 0, i+1 );
						innerSrc = b.join('.');
	
						// Traverse each entry in the array setting the properties requested
						if ( Array.isArray( val ) )
						{
							for ( var j=0, jLen=val.length ; j<jLen ; j++ )
							{
								o = {};
								setData( o, val[j], innerSrc );
								data[ a[i] ].push( o );
							}
						}
						else
						{
							// We've been asked to save data to an array, but it
							// isn't array data to be saved. Best that can be done
							// is to just save the value.
							data[ a[i] ] = val;
						}
	
						// The inner call to setData has already traversed through the remainder
						// of the source and has set the data, thus we can exit here
						return;
					}
					else if ( funcNotation )
					{
						// Function call
						a[i] = a[i].replace(__reFn, '');
						data = data[ a[i] ]( val );
					}
	
					// If the nested object doesn't currently exist - since we are
					// trying to set the value - create it
					if ( data[ a[i] ] === null || data[ a[i] ] === undefined )
					{
						data[ a[i] ] = {};
					}
					data = data[ a[i] ];
				}
	
				// Last item in the input - i.e, the actual set
				if ( aLast.match(__reFn ) )
				{
					// Function call
					data = data[ aLast.replace(__reFn, '') ]( val );
				}
				else
				{
					// If array notation is used, we just want to strip it and use the property name
					// and assign the value. If it isn't used, then we get the result we want anyway
					data[ aLast.replace(__reArray, '') ] = val;
				}
			};
	
			return function (data, val) { // meta is also passed in, but not used
				return setData( data, val, mSource );
			};
		}
		else
		{
			/* Array or flat object mapping */
			return function (data, val) { // meta is also passed in, but not used
				data[mSource] = val;
			};
		}
	}
	
	
	/**
	 * Return an array with the full table data
	 *  @param {object} oSettings dataTables settings object
	 *  @returns array {array} aData Master data array
	 *  @memberof DataTable#oApi
	 */
	function _fnGetDataMaster ( settings )
	{
		return _pluck( settings.aoData, '_aData' );
	}
	
	
	/**
	 * Nuke the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnClearTable( settings )
	{
		settings.aoData.length = 0;
		settings.aiDisplayMaster.length = 0;
		settings.aiDisplay.length = 0;
		settings.aIds = {};
	}
	
	
	 /**
	 * Take an array of integers (index array) and remove a target integer (value - not
	 * the key!)
	 *  @param {array} a Index array to target
	 *  @param {int} iTarget value to find
	 *  @memberof DataTable#oApi
	 */
	function _fnDeleteIndex( a, iTarget, splice )
	{
		var iTargetIndex = -1;
	
		for ( var i=0, iLen=a.length ; i<iLen ; i++ )
		{
			if ( a[i] == iTarget )
			{
				iTargetIndex = i;
			}
			else if ( a[i] > iTarget )
			{
				a[i]--;
			}
		}
	
		if ( iTargetIndex != -1 && splice === undefined )
		{
			a.splice( iTargetIndex, 1 );
		}
	}
	
	
	/**
	 * Mark cached data as invalid such that a re-read of the data will occur when
	 * the cached data is next requested. Also update from the data source object.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {int}    rowIdx   Row index to invalidate
	 * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
	 *     or 'data'
	 * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
	 *     row will be invalidated
	 * @memberof DataTable#oApi
	 *
	 * @todo For the modularisation of v1.11 this will need to become a callback, so
	 *   the sort and filter methods can subscribe to it. That will required
	 *   initialisation options for sorting, which is why it is not already baked in
	 */
	function _fnInvalidate( settings, rowIdx, src, colIdx )
	{
		var row = settings.aoData[ rowIdx ];
		var i, ien;
		var cellWrite = function ( cell, col ) {
			// This is very frustrating, but in IE if you just write directly
			// to innerHTML, and elements that are overwritten are GC'ed,
			// even if there is a reference to them elsewhere
			while ( cell.childNodes.length ) {
				cell.removeChild( cell.firstChild );
			}
	
			cell.innerHTML = _fnGetCellData( settings, rowIdx, col, 'display' );
		};
	
		// Are we reading last data from DOM or the data object?
		if ( src === 'dom' || ((! src || src === 'auto') && row.src === 'dom') ) {
			// Read the data from the DOM
			row._aData = _fnGetRowElements(
					settings, row, colIdx, colIdx === undefined ? undefined : row._aData
				)
				.data;
		}
		else {
			// Reading from data object, update the DOM
			var cells = row.anCells;
	
			if ( cells ) {
				if ( colIdx !== undefined ) {
					cellWrite( cells[colIdx], colIdx );
				}
				else {
					for ( i=0, ien=cells.length ; i<ien ; i++ ) {
						cellWrite( cells[i], i );
					}
				}
			}
		}
	
		// For both row and cell invalidation, the cached data for sorting and
		// filtering is nulled out
		row._aSortData = null;
		row._aFilterData = null;
	
		// Invalidate the type for a specific column (if given) or all columns since
		// the data might have changed
		var cols = settings.aoColumns;
		if ( colIdx !== undefined ) {
			cols[ colIdx ].sType = null;
		}
		else {
			for ( i=0, ien=cols.length ; i<ien ; i++ ) {
				cols[i].sType = null;
			}
	
			// Update DataTables special `DT_*` attributes for the row
			_fnRowAttributes( settings, row );
		}
	}
	
	
	/**
	 * Build a data source object from an HTML row, reading the contents of the
	 * cells that are in the row.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {node|object} TR element from which to read data or existing row
	 *   object from which to re-read the data from the cells
	 * @param {int} [colIdx] Optional column index
	 * @param {array|object} [d] Data source object. If `colIdx` is given then this
	 *   parameter should also be given and will be used to write the data into.
	 *   Only the column in question will be written
	 * @returns {object} Object with two parameters: `data` the data read, in
	 *   document order, and `cells` and array of nodes (they can be useful to the
	 *   caller, so rather than needing a second traversal to get them, just return
	 *   them from here).
	 * @memberof DataTable#oApi
	 */
	function _fnGetRowElements( settings, row, colIdx, d )
	{
		var
			tds = [],
			td = row.firstChild,
			name, col, o, i=0, contents,
			columns = settings.aoColumns,
			objectRead = settings._rowReadObject;
	
		// Allow the data object to be passed in, or construct
		d = d !== undefined ?
			d :
			objectRead ?
				{} :
				[];
	
		var attr = function ( str, td  ) {
			if ( typeof str === 'string' ) {
				var idx = str.indexOf('@');
	
				if ( idx !== -1 ) {
					var attr = str.substring( idx+1 );
					var setter = _fnSetObjectDataFn( str );
					setter( d, td.getAttribute( attr ) );
				}
			}
		};
	
		// Read data from a cell and store into the data object
		var cellProcess = function ( cell ) {
			if ( colIdx === undefined || colIdx === i ) {
				col = columns[i];
				contents = (cell.innerHTML).trim();
	
				if ( col && col._bAttrSrc ) {
					var setter = _fnSetObjectDataFn( col.mData._ );
					setter( d, contents );
	
					attr( col.mData.sort, cell );
					attr( col.mData.type, cell );
					attr( col.mData.filter, cell );
				}
				else {
					// Depending on the `data` option for the columns the data can
					// be read to either an object or an array.
					if ( objectRead ) {
						if ( ! col._setter ) {
							// Cache the setter function
							col._setter = _fnSetObjectDataFn( col.mData );
						}
						col._setter( d, contents );
					}
					else {
						d[i] = contents;
					}
				}
			}
	
			i++;
		};
	
		if ( td ) {
			// `tr` element was passed in
			while ( td ) {
				name = td.nodeName.toUpperCase();
	
				if ( name == "TD" || name == "TH" ) {
					cellProcess( td );
					tds.push( td );
				}
	
				td = td.nextSibling;
			}
		}
		else {
			// Existing row object passed in
			tds = row.anCells;
	
			for ( var j=0, jen=tds.length ; j<jen ; j++ ) {
				cellProcess( tds[j] );
			}
		}
	
		// Read the ID from the DOM if present
		var rowNode = row.firstChild ? row : row.nTr;
	
		if ( rowNode ) {
			var id = rowNode.getAttribute( 'id' );
	
			if ( id ) {
				_fnSetObjectDataFn( settings.rowId )( d, id );
			}
		}
	
		return {
			data: d,
			cells: tds
		};
	}
	/**
	 * Create a new TR element (and it's TD children) for a row
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iRow Row to consider
	 *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @memberof DataTable#oApi
	 */
	function _fnCreateTr ( oSettings, iRow, nTrIn, anTds )
	{
		var
			row = oSettings.aoData[iRow],
			rowData = row._aData,
			cells = [],
			nTr, nTd, oCol,
			i, iLen, create;
	
		if ( row.nTr === null )
		{
			nTr = nTrIn || document.createElement('tr');
	
			row.nTr = nTr;
			row.anCells = cells;
	
			/* Use a private property on the node to allow reserve mapping from the node
			 * to the aoData array for fast look up
			 */
			nTr._DT_RowIndex = iRow;
	
			/* Special parameters can be given by the data source to be used on the row */
			_fnRowAttributes( oSettings, row );
	
			/* Process each column */
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oCol = oSettings.aoColumns[i];
				create = nTrIn ? false : true;
	
				nTd = create ? document.createElement( oCol.sCellType ) : anTds[i];
				nTd._DT_CellIndex = {
					row: iRow,
					column: i
				};
				
				cells.push( nTd );
	
				// Need to create the HTML if new, or if a rendering function is defined
				if ( create || ((oCol.mRender || oCol.mData !== i) &&
					 (!$.isPlainObject(oCol.mData) || oCol.mData._ !== i+'.display')
				)) {
					nTd.innerHTML = _fnGetCellData( oSettings, iRow, i, 'display' );
				}
	
				/* Add user defined class */
				if ( oCol.sClass )
				{
					nTd.className += ' '+oCol.sClass;
				}
	
				// Visibility - add or remove as required
				if ( oCol.bVisible && ! nTrIn )
				{
					nTr.appendChild( nTd );
				}
				else if ( ! oCol.bVisible && nTrIn )
				{
					nTd.parentNode.removeChild( nTd );
				}
	
				if ( oCol.fnCreatedCell )
				{
					oCol.fnCreatedCell.call( oSettings.oInstance,
						nTd, _fnGetCellData( oSettings, iRow, i ), rowData, iRow, i
					);
				}
			}
	
			_fnCallbackFire( oSettings, 'aoRowCreatedCallback', null, [nTr, rowData, iRow, cells] );
		}
	}
	
	
	/**
	 * Add attributes to a row based on the special `DT_*` parameters in a data
	 * source object.
	 *  @param {object} settings DataTables settings object
	 *  @param {object} DataTables row object for the row to be modified
	 *  @memberof DataTable#oApi
	 */
	function _fnRowAttributes( settings, row )
	{
		var tr = row.nTr;
		var data = row._aData;
	
		if ( tr ) {
			var id = settings.rowIdFn( data );
	
			if ( id ) {
				tr.id = id;
			}
	
			if ( data.DT_RowClass ) {
				// Remove any classes added by DT_RowClass before
				var a = data.DT_RowClass.split(' ');
				row.__rowc = row.__rowc ?
					_unique( row.__rowc.concat( a ) ) :
					a;
	
				$(tr)
					.removeClass( row.__rowc.join(' ') )
					.addClass( data.DT_RowClass );
			}
	
			if ( data.DT_RowAttr ) {
				$(tr).attr( data.DT_RowAttr );
			}
	
			if ( data.DT_RowData ) {
				$(tr).data( data.DT_RowData );
			}
		}
	}
	
	
	/**
	 * Create the HTML header for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBuildHead( oSettings )
	{
		var i, ien, cell, row, column;
		var thead = oSettings.nTHead;
		var tfoot = oSettings.nTFoot;
		var createHeader = $('th, td', thead).length === 0;
		var classes = oSettings.oClasses;
		var columns = oSettings.aoColumns;
	
		if ( createHeader ) {
			row = $('<tr/>').appendTo( thead );
		}
	
		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			column = columns[i];
			cell = $( column.nTh ).addClass( column.sClass );
	
			if ( createHeader ) {
				cell.appendTo( row );
			}
	
			// 1.11 move into sorting
			if ( oSettings.oFeatures.bSort ) {
				cell.addClass( column.sSortingClass );
	
				if ( column.bSortable !== false ) {
					cell
						.attr( 'tabindex', oSettings.iTabIndex )
						.attr( 'aria-controls', oSettings.sTableId );
	
					_fnSortAttachListener( oSettings, column.nTh, i );
				}
			}
	
			if ( column.sTitle != cell[0].innerHTML ) {
				cell.html( column.sTitle );
			}
	
			_fnRenderer( oSettings, 'header' )(
				oSettings, cell, column, classes
			);
		}
	
		if ( createHeader ) {
			_fnDetectHeader( oSettings.aoHeader, thead );
		}
		
		/* ARIA role for the rows */
		$(thead).children('tr').attr('role', 'row');
	
		/* Deal with the footer - add classes if required */
		$(thead).children('tr').children('th, td').addClass( classes.sHeaderTH );
		$(tfoot).children('tr').children('th, td').addClass( classes.sFooterTH );
	
		// Cache the footer cells. Note that we only take the cells from the first
		// row in the footer. If there is more than one row the user wants to
		// interact with, they need to use the table().foot() method. Note also this
		// allows cells to be used for multiple columns using colspan
		if ( tfoot !== null ) {
			var cells = oSettings.aoFooter[0];
	
			for ( i=0, ien=cells.length ; i<ien ; i++ ) {
				column = columns[i];
				column.nTf = cells[i].cell;
	
				if ( column.sClass ) {
					$(column.nTf).addClass( column.sClass );
				}
			}
		}
	}
	
	
	/**
	 * Draw the header (or footer) element based on the column visibility states. The
	 * methodology here is to use the layout array from _fnDetectHeader, modified for
	 * the instantaneous column visibility, to construct the new layout. The grid is
	 * traversed over cell at a time in a rows x columns grid fashion, although each
	 * cell insert can cover multiple elements in the grid - which is tracks using the
	 * aApplied array. Cell inserts in the grid will only occur where there isn't
	 * already a cell in that position.
	 *  @param {object} oSettings dataTables settings object
	 *  @param array {objects} aoSource Layout array from _fnDetectHeader
	 *  @param {boolean} [bIncludeHidden=false] If true then include the hidden columns in the calc,
	 *  @memberof DataTable#oApi
	 */
	function _fnDrawHead( oSettings, aoSource, bIncludeHidden )
	{
		var i, iLen, j, jLen, k, kLen, n, nLocalTr;
		var aoLocal = [];
		var aApplied = [];
		var iColumns = oSettings.aoColumns.length;
		var iRowspan, iColspan;
	
		if ( ! aoSource )
		{
			return;
		}
	
		if (  bIncludeHidden === undefined )
		{
			bIncludeHidden = false;
		}
	
		/* Make a copy of the master layout array, but without the visible columns in it */
		for ( i=0, iLen=aoSource.length ; i<iLen ; i++ )
		{
			aoLocal[i] = aoSource[i].slice();
			aoLocal[i].nTr = aoSource[i].nTr;
	
			/* Remove any columns which are currently hidden */
			for ( j=iColumns-1 ; j>=0 ; j-- )
			{
				if ( !oSettings.aoColumns[j].bVisible && !bIncludeHidden )
				{
					aoLocal[i].splice( j, 1 );
				}
			}
	
			/* Prep the applied array - it needs an element for each row */
			aApplied.push( [] );
		}
	
		for ( i=0, iLen=aoLocal.length ; i<iLen ; i++ )
		{
			nLocalTr = aoLocal[i].nTr;
	
			/* All cells are going to be replaced, so empty out the row */
			if ( nLocalTr )
			{
				while( (n = nLocalTr.firstChild) )
				{
					nLocalTr.removeChild( n );
				}
			}
	
			for ( j=0, jLen=aoLocal[i].length ; j<jLen ; j++ )
			{
				iRowspan = 1;
				iColspan = 1;
	
				/* Check to see if there is already a cell (row/colspan) covering our target
				 * insert point. If there is, then there is nothing to do.
				 */
				if ( aApplied[i][j] === undefined )
				{
					nLocalTr.appendChild( aoLocal[i][j].cell );
					aApplied[i][j] = 1;
	
					/* Expand the cell to cover as many rows as needed */
					while ( aoLocal[i+iRowspan] !== undefined &&
					        aoLocal[i][j].cell == aoLocal[i+iRowspan][j].cell )
					{
						aApplied[i+iRowspan][j] = 1;
						iRowspan++;
					}
	
					/* Expand the cell to cover as many columns as needed */
					while ( aoLocal[i][j+iColspan] !== undefined &&
					        aoLocal[i][j].cell == aoLocal[i][j+iColspan].cell )
					{
						/* Must update the applied array over the rows for the columns */
						for ( k=0 ; k<iRowspan ; k++ )
						{
							aApplied[i+k][j+iColspan] = 1;
						}
						iColspan++;
					}
	
					/* Do the actual expansion in the DOM */
					$(aoLocal[i][j].cell)
						.attr('rowspan', iRowspan)
						.attr('colspan', iColspan);
				}
			}
		}
	}
	
	
	/**
	 * Insert the required TR nodes into the table for display
	 *  @param {object} oSettings dataTables settings object
	 *  @param ajaxComplete true after ajax call to complete rendering
	 *  @memberof DataTable#oApi
	 */
	function _fnDraw( oSettings, ajaxComplete )
	{
		/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
		var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
		if ( $.inArray( false, aPreDraw ) !== -1 )
		{
			_fnProcessingDisplay( oSettings, false );
			return;
		}
	
		var i, iLen, n;
		var anRows = [];
		var iRowCount = 0;
		var asStripeClasses = oSettings.asStripeClasses;
		var iStripes = asStripeClasses.length;
		var iOpenRows = oSettings.aoOpenRows.length;
		var oLang = oSettings.oLanguage;
		var iInitDisplayStart = oSettings.iInitDisplayStart;
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var aiDisplay = oSettings.aiDisplay;
	
		oSettings.bDrawing = true;
	
		/* Check and see if we have an initial draw position from state saving */
		if ( iInitDisplayStart !== undefined && iInitDisplayStart !== -1 )
		{
			oSettings._iDisplayStart = bServerSide ?
				iInitDisplayStart :
				iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
					0 :
					iInitDisplayStart;
	
			oSettings.iInitDisplayStart = -1;
		}
	
		var iDisplayStart = oSettings._iDisplayStart;
		var iDisplayEnd = oSettings.fnDisplayEnd();
	
		/* Server-side processing draw intercept */
		if ( oSettings.bDeferLoading )
		{
			oSettings.bDeferLoading = false;
			oSettings.iDraw++;
			_fnProcessingDisplay( oSettings, false );
		}
		else if ( !bServerSide )
		{
			oSettings.iDraw++;
		}
		else if ( !oSettings.bDestroying && !ajaxComplete)
		{
			_fnAjaxUpdate( oSettings );
			return;
		}
	
		if ( aiDisplay.length !== 0 )
		{
			var iStart = bServerSide ? 0 : iDisplayStart;
			var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
	
			for ( var j=iStart ; j<iEnd ; j++ )
			{
				var iDataIndex = aiDisplay[j];
				var aoData = oSettings.aoData[ iDataIndex ];
				if ( aoData.nTr === null )
				{
					_fnCreateTr( oSettings, iDataIndex );
				}
	
				var nRow = aoData.nTr;
	
				/* Remove the old striping classes and then add the new one */
				if ( iStripes !== 0 )
				{
					var sStripe = asStripeClasses[ iRowCount % iStripes ];
					if ( aoData._sRowStripe != sStripe )
					{
						$(nRow).removeClass( aoData._sRowStripe ).addClass( sStripe );
						aoData._sRowStripe = sStripe;
					}
				}
	
				// Row callback functions - might want to manipulate the row
				// iRowCount and j are not currently documented. Are they at all
				// useful?
				_fnCallbackFire( oSettings, 'aoRowCallback', null,
					[nRow, aoData._aData, iRowCount, j, iDataIndex] );
	
				anRows.push( nRow );
				iRowCount++;
			}
		}
		else
		{
			/* Table is empty - create a row with an empty message in it */
			var sZero = oLang.sZeroRecords;
			if ( oSettings.iDraw == 1 &&  _fnDataSource( oSettings ) == 'ajax' )
			{
				sZero = oLang.sLoadingRecords;
			}
			else if ( oLang.sEmptyTable && oSettings.fnRecordsTotal() === 0 )
			{
				sZero = oLang.sEmptyTable;
			}
	
			anRows[ 0 ] = $( '<tr/>', { 'class': iStripes ? asStripeClasses[0] : '' } )
				.append( $('<td />', {
					'valign':  'top',
					'colSpan': _fnVisbleColumns( oSettings ),
					'class':   oSettings.oClasses.sRowEmpty
				} ).html( sZero ) )[0];
		}
	
		/* Header and footer callbacks */
		_fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		_fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		var body = $(oSettings.nTBody);
	
		body.children().detach();
		body.append( $(anRows) );
	
		/* Call all required callback functions for the end of a draw */
		_fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings] );
	
		/* Draw is complete, sorting and filtering must be as well */
		oSettings.bSorted = false;
		oSettings.bFiltered = false;
		oSettings.bDrawing = false;
	}
	
	
	/**
	 * Redraw the table - taking account of the various features which are enabled
	 *  @param {object} oSettings dataTables settings object
	 *  @param {boolean} [holdPosition] Keep the current paging position. By default
	 *    the paging is reset to the first page
	 *  @memberof DataTable#oApi
	 */
	function _fnReDraw( settings, holdPosition )
	{
		var
			features = settings.oFeatures,
			sort     = features.bSort,
			filter   = features.bFilter;
	
		if ( sort ) {
			_fnSort( settings );
		}
	
		if ( filter ) {
			_fnFilterComplete( settings, settings.oPreviousSearch );
		}
		else {
			// No filtering, so we want to just use the display master
			settings.aiDisplay = settings.aiDisplayMaster.slice();
		}
	
		if ( holdPosition !== true ) {
			settings._iDisplayStart = 0;
		}
	
		// Let any modules know about the draw hold position state (used by
		// scrolling internally)
		settings._drawHold = holdPosition;
	
		_fnDraw( settings );
	
		settings._drawHold = false;
	}
	
	
	/**
	 * Add the options to the page HTML for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddOptionsHtml ( oSettings )
	{
		var classes = oSettings.oClasses;
		var table = $(oSettings.nTable);
		var holding = $('<div/>').insertBefore( table ); // Holding element for speed
		var features = oSettings.oFeatures;
	
		// All DataTables are wrapped in a div
		var insert = $('<div/>', {
			id:      oSettings.sTableId+'_wrapper',
			'class': classes.sWrapper + (oSettings.nTFoot ? '' : ' '+classes.sNoFooter)
		} );
	
		oSettings.nHolding = holding[0];
		oSettings.nTableWrapper = insert[0];
		oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;
	
		/* Loop over the user set positioning and place the elements as needed */
		var aDom = oSettings.sDom.split('');
		var featureNode, cOption, nNewNode, cNext, sAttr, j;
		for ( var i=0 ; i<aDom.length ; i++ )
		{
			featureNode = null;
			cOption = aDom[i];
	
			if ( cOption == '<' )
			{
				/* New container div */
				nNewNode = $('<div/>')[0];
	
				/* Check to see if we should append an id and/or a class name to the container */
				cNext = aDom[i+1];
				if ( cNext == "'" || cNext == '"' )
				{
					sAttr = "";
					j = 2;
					while ( aDom[i+j] != cNext )
					{
						sAttr += aDom[i+j];
						j++;
					}
	
					/* Replace jQuery UI constants @todo depreciated */
					if ( sAttr == "H" )
					{
						sAttr = classes.sJUIHeader;
					}
					else if ( sAttr == "F" )
					{
						sAttr = classes.sJUIFooter;
					}
	
					/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
					 * breaks the string into parts and applies them as needed
					 */
					if ( sAttr.indexOf('.') != -1 )
					{
						var aSplit = sAttr.split('.');
						nNewNode.id = aSplit[0].substr(1, aSplit[0].length-1);
						nNewNode.className = aSplit[1];
					}
					else if ( sAttr.charAt(0) == "#" )
					{
						nNewNode.id = sAttr.substr(1, sAttr.length-1);
					}
					else
					{
						nNewNode.className = sAttr;
					}
	
					i += j; /* Move along the position array */
				}
	
				insert.append( nNewNode );
				insert = $(nNewNode);
			}
			else if ( cOption == '>' )
			{
				/* End container div */
				insert = insert.parent();
			}
			// @todo Move options into their own plugins?
			else if ( cOption == 'l' && features.bPaginate && features.bLengthChange )
			{
				/* Length */
				featureNode = _fnFeatureHtmlLength( oSettings );
			}
			else if ( cOption == 'f' && features.bFilter )
			{
				/* Filter */
				featureNode = _fnFeatureHtmlFilter( oSettings );
			}
			else if ( cOption == 'r' && features.bProcessing )
			{
				/* pRocessing */
				featureNode = _fnFeatureHtmlProcessing( oSettings );
			}
			else if ( cOption == 't' )
			{
				/* Table */
				featureNode = _fnFeatureHtmlTable( oSettings );
			}
			else if ( cOption ==  'i' && features.bInfo )
			{
				/* Info */
				featureNode = _fnFeatureHtmlInfo( oSettings );
			}
			else if ( cOption == 'p' && features.bPaginate )
			{
				/* Pagination */
				featureNode = _fnFeatureHtmlPaginate( oSettings );
			}
			else if ( DataTable.ext.feature.length !== 0 )
			{
				/* Plug-in features */
				var aoFeatures = DataTable.ext.feature;
				for ( var k=0, kLen=aoFeatures.length ; k<kLen ; k++ )
				{
					if ( cOption == aoFeatures[k].cFeature )
					{
						featureNode = aoFeatures[k].fnInit( oSettings );
						break;
					}
				}
			}
	
			/* Add to the 2D features array */
			if ( featureNode )
			{
				var aanFeatures = oSettings.aanFeatures;
	
				if ( ! aanFeatures[cOption] )
				{
					aanFeatures[cOption] = [];
				}
	
				aanFeatures[cOption].push( featureNode );
				insert.append( featureNode );
			}
		}
	
		/* Built our DOM structure - replace the holding div with what we want */
		holding.replaceWith( insert );
		oSettings.nHolding = null;
	}
	
	
	/**
	 * Use the DOM source to create up an array of header cells. The idea here is to
	 * create a layout grid (array) of rows x columns, which contains a reference
	 * to the cell that that point in the grid (regardless of col/rowspan), such that
	 * any column / row could be removed and the new grid constructed
	 *  @param array {object} aLayout Array to store the calculated layout in
	 *  @param {node} nThead The header/footer element for the table
	 *  @memberof DataTable#oApi
	 */
	function _fnDetectHeader ( aLayout, nThead )
	{
		var nTrs = $(nThead).children('tr');
		var nTr, nCell;
		var i, k, l, iLen, jLen, iColShifted, iColumn, iColspan, iRowspan;
		var bUnique;
		var fnShiftCol = function ( a, i, j ) {
			var k = a[i];
	                while ( k[j] ) {
				j++;
			}
			return j;
		};
	
		aLayout.splice( 0, aLayout.length );
	
		/* We know how many rows there are in the layout - so prep it */
		for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
		{
			aLayout.push( [] );
		}
	
		/* Calculate a layout array */
		for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
		{
			nTr = nTrs[i];
			iColumn = 0;
	
			/* For every cell in the row... */
			nCell = nTr.firstChild;
			while ( nCell ) {
				if ( nCell.nodeName.toUpperCase() == "TD" ||
				     nCell.nodeName.toUpperCase() == "TH" )
				{
					/* Get the col and rowspan attributes from the DOM and sanitise them */
					iColspan = nCell.getAttribute('colspan') * 1;
					iRowspan = nCell.getAttribute('rowspan') * 1;
					iColspan = (!iColspan || iColspan===0 || iColspan===1) ? 1 : iColspan;
					iRowspan = (!iRowspan || iRowspan===0 || iRowspan===1) ? 1 : iRowspan;
	
					/* There might be colspan cells already in this row, so shift our target
					 * accordingly
					 */
					iColShifted = fnShiftCol( aLayout, i, iColumn );
	
					/* Cache calculation for unique columns */
					bUnique = iColspan === 1 ? true : false;
	
					/* If there is col / rowspan, copy the information into the layout grid */
					for ( l=0 ; l<iColspan ; l++ )
					{
						for ( k=0 ; k<iRowspan ; k++ )
						{
							aLayout[i+k][iColShifted+l] = {
								"cell": nCell,
								"unique": bUnique
							};
							aLayout[i+k].nTr = nTr;
						}
					}
				}
				nCell = nCell.nextSibling;
			}
		}
	}
	
	
	/**
	 * Get an array of unique th elements, one for each column
	 *  @param {object} oSettings dataTables settings object
	 *  @param {node} nHeader automatically detect the layout from this node - optional
	 *  @param {array} aLayout thead/tfoot layout from _fnDetectHeader - optional
	 *  @returns array {node} aReturn list of unique th's
	 *  @memberof DataTable#oApi
	 */
	function _fnGetUniqueThs ( oSettings, nHeader, aLayout )
	{
		var aReturn = [];
		if ( !aLayout )
		{
			aLayout = oSettings.aoHeader;
			if ( nHeader )
			{
				aLayout = [];
				_fnDetectHeader( aLayout, nHeader );
			}
		}
	
		for ( var i=0, iLen=aLayout.length ; i<iLen ; i++ )
		{
			for ( var j=0, jLen=aLayout[i].length ; j<jLen ; j++ )
			{
				if ( aLayout[i][j].unique &&
					 (!aReturn[j] || !oSettings.bSortCellsTop) )
				{
					aReturn[j] = aLayout[i][j].cell;
				}
			}
		}
	
		return aReturn;
	}
	
	/**
	 * Create an Ajax call based on the table's settings, taking into account that
	 * parameters can have multiple forms, and backwards compatibility.
	 *
	 * @param {object} oSettings dataTables settings object
	 * @param {array} data Data to send to the server, required by
	 *     DataTables - may be augmented by developer callbacks
	 * @param {function} fn Callback function to run when data is obtained
	 */
	function _fnBuildAjax( oSettings, data, fn )
	{
		// Compatibility with 1.9-, allow fnServerData and event to manipulate
		_fnCallbackFire( oSettings, 'aoServerParams', 'serverParams', [data] );
	
		// Convert to object based for 1.10+ if using the old array scheme which can
		// come from server-side processing or serverParams
		if ( data && Array.isArray(data) ) {
			var tmp = {};
			var rbracket = /(.*?)\[\]$/;
	
			$.each( data, function (key, val) {
				var match = val.name.match(rbracket);
	
				if ( match ) {
					// Support for arrays
					var name = match[0];
	
					if ( ! tmp[ name ] ) {
						tmp[ name ] = [];
					}
					tmp[ name ].push( val.value );
				}
				else {
					tmp[val.name] = val.value;
				}
			} );
			data = tmp;
		}
	
		var ajaxData;
		var ajax = oSettings.ajax;
		var instance = oSettings.oInstance;
		var callback = function ( json ) {
			_fnCallbackFire( oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR] );
			fn( json );
		};
	
		if ( $.isPlainObject( ajax ) && ajax.data )
		{
			ajaxData = ajax.data;
	
			var newData = typeof ajaxData === 'function' ?
				ajaxData( data, oSettings ) :  // fn can manipulate data or return
				ajaxData;                      // an object object or array to merge
	
			// If the function returned something, use that alone
			data = typeof ajaxData === 'function' && newData ?
				newData :
				$.extend( true, data, newData );
	
			// Remove the data property as we've resolved it already and don't want
			// jQuery to do it again (it is restored at the end of the function)
			delete ajax.data;
		}
	
		var baseAjax = {
			"data": data,
			"success": function (json) {
				var error = json.error || json.sError;
				if ( error ) {
					_fnLog( oSettings, 0, error );
				}
	
				oSettings.json = json;
				callback( json );
			},
			"dataType": "json",
			"cache": false,
			"type": oSettings.sServerMethod,
			"error": function (xhr, error, thrown) {
				var ret = _fnCallbackFire( oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR] );
	
				if ( $.inArray( true, ret ) === -1 ) {
					if ( error == "parsererror" ) {
						_fnLog( oSettings, 0, 'Invalid JSON response', 1 );
					}
					else if ( xhr.readyState === 4 ) {
						_fnLog( oSettings, 0, 'Ajax error', 7 );
					}
				}
	
				_fnProcessingDisplay( oSettings, false );
			}
		};
	
		// Store the data submitted for the API
		oSettings.oAjaxData = data;
	
		// Allow plug-ins and external processes to modify the data
		_fnCallbackFire( oSettings, null, 'preXhr', [oSettings, data] );
	
		if ( oSettings.fnServerData )
		{
			// DataTables 1.9- compatibility
			oSettings.fnServerData.call( instance,
				oSettings.sAjaxSource,
				$.map( data, function (val, key) { // Need to convert back to 1.9 trad format
					return { name: key, value: val };
				} ),
				callback,
				oSettings
			);
		}
		else if ( oSettings.sAjaxSource || typeof ajax === 'string' )
		{
			// DataTables 1.9- compatibility
			oSettings.jqXHR = $.ajax( $.extend( baseAjax, {
				url: ajax || oSettings.sAjaxSource
			} ) );
		}
		else if ( typeof ajax === 'function' )
		{
			// Is a function - let the caller define what needs to be done
			oSettings.jqXHR = ajax.call( instance, data, callback, oSettings );
		}
		else
		{
			// Object to extend the base settings
			oSettings.jqXHR = $.ajax( $.extend( baseAjax, ajax ) );
	
			// Restore for next time around
			ajax.data = ajaxData;
		}
	}
	
	
	/**
	 * Update the table using an Ajax call
	 *  @param {object} settings dataTables settings object
	 *  @returns {boolean} Block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdate( settings )
	{
		settings.iDraw++;
		_fnProcessingDisplay( settings, true );
	
		_fnBuildAjax(
			settings,
			_fnAjaxParameters( settings ),
			function(json) {
				_fnAjaxUpdateDraw( settings, json );
			}
		);
	}
	
	
	/**
	 * Build up the parameters in an object needed for a server-side processing
	 * request. Note that this is basically done twice, is different ways - a modern
	 * method which is used by default in DataTables 1.10 which uses objects and
	 * arrays, or the 1.9- method with is name / value pairs. 1.9 method is used if
	 * the sAjaxSource option is used in the initialisation, or the legacyAjax
	 * option is set.
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {bool} block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxParameters( settings )
	{
		var
			columns = settings.aoColumns,
			columnCount = columns.length,
			features = settings.oFeatures,
			preSearch = settings.oPreviousSearch,
			preColSearch = settings.aoPreSearchCols,
			i, data = [], dataProp, column, columnSearch,
			sort = _fnSortFlatten( settings ),
			displayStart = settings._iDisplayStart,
			displayLength = features.bPaginate !== false ?
				settings._iDisplayLength :
				-1;
	
		var param = function ( name, value ) {
			data.push( { 'name': name, 'value': value } );
		};
	
		// DataTables 1.9- compatible method
		param( 'sEcho',          settings.iDraw );
		param( 'iColumns',       columnCount );
		param( 'sColumns',       _pluck( columns, 'sName' ).join(',') );
		param( 'iDisplayStart',  displayStart );
		param( 'iDisplayLength', displayLength );
	
		// DataTables 1.10+ method
		var d = {
			draw:    settings.iDraw,
			columns: [],
			order:   [],
			start:   displayStart,
			length:  displayLength,
			search:  {
				value: preSearch.sSearch,
				regex: preSearch.bRegex
			}
		};
	
		for ( i=0 ; i<columnCount ; i++ ) {
			column = columns[i];
			columnSearch = preColSearch[i];
			dataProp = typeof column.mData=="function" ? 'function' : column.mData ;
	
			d.columns.push( {
				data:       dataProp,
				name:       column.sName,
				searchable: column.bSearchable,
				orderable:  column.bSortable,
				search:     {
					value: columnSearch.sSearch,
					regex: columnSearch.bRegex
				}
			} );
	
			param( "mDataProp_"+i, dataProp );
	
			if ( features.bFilter ) {
				param( 'sSearch_'+i,     columnSearch.sSearch );
				param( 'bRegex_'+i,      columnSearch.bRegex );
				param( 'bSearchable_'+i, column.bSearchable );
			}
	
			if ( features.bSort ) {
				param( 'bSortable_'+i, column.bSortable );
			}
		}
	
		if ( features.bFilter ) {
			param( 'sSearch', preSearch.sSearch );
			param( 'bRegex', preSearch.bRegex );
		}
	
		if ( features.bSort ) {
			$.each( sort, function ( i, val ) {
				d.order.push( { column: val.col, dir: val.dir } );
	
				param( 'iSortCol_'+i, val.col );
				param( 'sSortDir_'+i, val.dir );
			} );
	
			param( 'iSortingCols', sort.length );
		}
	
		// If the legacy.ajax parameter is null, then we automatically decide which
		// form to use, based on sAjaxSource
		var legacy = DataTable.ext.legacy.ajax;
		if ( legacy === null ) {
			return settings.sAjaxSource ? data : d;
		}
	
		// Otherwise, if legacy has been specified then we use that to decide on the
		// form
		return legacy ? data : d;
	}
	
	
	/**
	 * Data the data from the server (nuking the old) and redraw the table
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} json json data return from the server.
	 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
	 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
	 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
	 *  @param {array} json.aaData The data to display on this page
	 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdateDraw ( settings, json )
	{
		// v1.10 uses camelCase variables, while 1.9 uses Hungarian notation.
		// Support both
		var compat = function ( old, modern ) {
			return json[old] !== undefined ? json[old] : json[modern];
		};
	
		var data = _fnAjaxDataSrc( settings, json );
		var draw            = compat( 'sEcho',                'draw' );
		var recordsTotal    = compat( 'iTotalRecords',        'recordsTotal' );
		var recordsFiltered = compat( 'iTotalDisplayRecords', 'recordsFiltered' );
	
		if ( draw !== undefined ) {
			// Protect against out of sequence returns
			if ( draw*1 < settings.iDraw ) {
				return;
			}
			settings.iDraw = draw * 1;
		}
	
		_fnClearTable( settings );
		settings._iRecordsTotal   = parseInt(recordsTotal, 10);
		settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
	
		for ( var i=0, ien=data.length ; i<ien ; i++ ) {
			_fnAddData( settings, data[i] );
		}
		settings.aiDisplay = settings.aiDisplayMaster.slice();
	
		_fnDraw( settings, true );
	
		if ( ! settings._bInitComplete ) {
			_fnInitComplete( settings, json );
		}
	
		_fnProcessingDisplay( settings, false );
	}
	
	
	/**
	 * Get the data from the JSON data source to use for drawing a table. Using
	 * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
	 * source object, or from a processing function.
	 *  @param {object} oSettings dataTables settings object
	 *  @param  {object} json Data source object / array from the server
	 *  @return {array} Array of data to use
	 */
	function _fnAjaxDataSrc ( oSettings, json )
	{
		var dataSrc = $.isPlainObject( oSettings.ajax ) && oSettings.ajax.dataSrc !== undefined ?
			oSettings.ajax.dataSrc :
			oSettings.sAjaxDataProp; // Compatibility with 1.9-.
	
		// Compatibility with 1.9-. In order to read from aaData, check if the
		// default has been changed, if not, check for aaData
		if ( dataSrc === 'data' ) {
			return json.aaData || json[dataSrc];
		}
	
		return dataSrc !== "" ?
			_fnGetObjectDataFn( dataSrc )( json ) :
			json;
	}
	
	/**
	 * Generate the node required for filtering text
	 *  @returns {node} Filter control element
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlFilter ( settings )
	{
		var classes = settings.oClasses;
		var tableId = settings.sTableId;
		var language = settings.oLanguage;
		var previousSearch = settings.oPreviousSearch;
		var features = settings.aanFeatures;
		var input = '<input type="search" class="'+classes.sFilterInput+'"/>';
	
		var str = language.sSearch;
		str = str.match(/_INPUT_/) ?
			str.replace('_INPUT_', input) :
			str+input;
	
		var filter = $('<div/>', {
				'id': ! features.f ? tableId+'_filter' : null,
				'class': classes.sFilter
			} )
			.append( $('<label/>' ).append( str ) );
	
		var searchFn = function() {
			/* Update all other filter input elements for the new display */
			var n = features.f;
			var val = !this.value ? "" : this.value; // mental IE8 fix :-(
	
			/* Now do the filter */
			if ( val != previousSearch.sSearch ) {
				_fnFilterComplete( settings, {
					"sSearch": val,
					"bRegex": previousSearch.bRegex,
					"bSmart": previousSearch.bSmart ,
					"bCaseInsensitive": previousSearch.bCaseInsensitive
				} );
	
				// Need to redraw, without resorting
				settings._iDisplayStart = 0;
				_fnDraw( settings );
			}
		};
	
		var searchDelay = settings.searchDelay !== null ?
			settings.searchDelay :
			_fnDataSource( settings ) === 'ssp' ?
				400 :
				0;
	
		var jqFilter = $('input', filter)
			.val( previousSearch.sSearch )
			.attr( 'placeholder', language.sSearchPlaceholder )
			.on(
				'keyup.DT search.DT input.DT paste.DT cut.DT',
				searchDelay ?
					_fnThrottle( searchFn, searchDelay ) :
					searchFn
			)
			.on( 'mouseup', function(e) {
				// Edge fix! Edge 17 does not trigger anything other than mouse events when clicking
				// on the clear icon (Edge bug 17584515). This is safe in other browsers as `searchFn`
				// checks the value to see if it has changed. In other browsers it won't have.
				setTimeout( function () {
					searchFn.call(jqFilter[0]);
				}, 10);
			} )
			.on( 'keypress.DT', function(e) {
				/* Prevent form submission */
				if ( e.keyCode == 13 ) {
					return false;
				}
			} )
			.attr('aria-controls', tableId);
	
		// Update the input elements whenever the table is filtered
		$(settings.nTable).on( 'search.dt.DT', function ( ev, s ) {
			if ( settings === s ) {
				// IE9 throws an 'unknown error' if document.activeElement is used
				// inside an iframe or frame...
				try {
					if ( jqFilter[0] !== document.activeElement ) {
						jqFilter.val( previousSearch.sSearch );
					}
				}
				catch ( e ) {}
			}
		} );
	
		return filter[0];
	}
	
	
	/**
	 * Filter the table using both the global filter and column based filtering
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} oSearch search information
	 *  @param {int} [iForce] force a research of the master array (1) or not (undefined or 0)
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterComplete ( oSettings, oInput, iForce )
	{
		var oPrevSearch = oSettings.oPreviousSearch;
		var aoPrevSearch = oSettings.aoPreSearchCols;
		var fnSaveFilter = function ( oFilter ) {
			/* Save the filtering values */
			oPrevSearch.sSearch = oFilter.sSearch;
			oPrevSearch.bRegex = oFilter.bRegex;
			oPrevSearch.bSmart = oFilter.bSmart;
			oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
		};
		var fnRegex = function ( o ) {
			// Backwards compatibility with the bEscapeRegex option
			return o.bEscapeRegex !== undefined ? !o.bEscapeRegex : o.bRegex;
		};
	
		// Resolve any column types that are unknown due to addition or invalidation
		// @todo As per sort - can this be moved into an event handler?
		_fnColumnTypes( oSettings );
	
		/* In server-side processing all filtering is done by the server, so no point hanging around here */
		if ( _fnDataSource( oSettings ) != 'ssp' )
		{
			/* Global filter */
			_fnFilter( oSettings, oInput.sSearch, iForce, fnRegex(oInput), oInput.bSmart, oInput.bCaseInsensitive );
			fnSaveFilter( oInput );
	
			/* Now do the individual column filter */
			for ( var i=0 ; i<aoPrevSearch.length ; i++ )
			{
				_fnFilterColumn( oSettings, aoPrevSearch[i].sSearch, i, fnRegex(aoPrevSearch[i]),
					aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive );
			}
	
			/* Custom filtering */
			_fnFilterCustom( oSettings );
		}
		else
		{
			fnSaveFilter( oInput );
		}
	
		/* Tell the draw function we have been filtering */
		oSettings.bFiltered = true;
		_fnCallbackFire( oSettings, null, 'search', [oSettings] );
	}
	
	
	/**
	 * Apply custom filtering functions
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCustom( settings )
	{
		var filters = DataTable.ext.search;
		var displayRows = settings.aiDisplay;
		var row, rowIdx;
	
		for ( var i=0, ien=filters.length ; i<ien ; i++ ) {
			var rows = [];
	
			// Loop over each row and see if it should be included
			for ( var j=0, jen=displayRows.length ; j<jen ; j++ ) {
				rowIdx = displayRows[ j ];
				row = settings.aoData[ rowIdx ];
	
				if ( filters[i]( settings, row._aFilterData, rowIdx, row._aData, j ) ) {
					rows.push( rowIdx );
				}
			}
	
			// So the array reference doesn't break set the results into the
			// existing array
			displayRows.length = 0;
			$.merge( displayRows, rows );
		}
	}
	
	
	/**
	 * Filter the table on a per-column basis
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sInput string to filter on
	 *  @param {int} iColumn column to filter
	 *  @param {bool} bRegex treat search string as a regular expression or not
	 *  @param {bool} bSmart use smart filtering or not
	 *  @param {bool} bCaseInsensitive Do case insenstive matching or not
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterColumn ( settings, searchStr, colIdx, regex, smart, caseInsensitive )
	{
		if ( searchStr === '' ) {
			return;
		}
	
		var data;
		var out = [];
		var display = settings.aiDisplay;
		var rpSearch = _fnFilterCreateSearch( searchStr, regex, smart, caseInsensitive );
	
		for ( var i=0 ; i<display.length ; i++ ) {
			data = settings.aoData[ display[i] ]._aFilterData[ colIdx ];
	
			if ( rpSearch.test( data ) ) {
				out.push( display[i] );
			}
		}
	
		settings.aiDisplay = out;
	}
	
	
	/**
	 * Filter the data table based on user input and draw the table
	 *  @param {object} settings dataTables settings object
	 *  @param {string} input string to filter on
	 *  @param {int} force optional - force a research of the master array (1) or not (undefined or 0)
	 *  @param {bool} regex treat as a regular expression or not
	 *  @param {bool} smart perform smart filtering or not
	 *  @param {bool} caseInsensitive Do case insenstive matching or not
	 *  @memberof DataTable#oApi
	 */
	function _fnFilter( settings, input, force, regex, smart, caseInsensitive )
	{
		var rpSearch = _fnFilterCreateSearch( input, regex, smart, caseInsensitive );
		var prevSearch = settings.oPreviousSearch.sSearch;
		var displayMaster = settings.aiDisplayMaster;
		var display, invalidated, i;
		var filtered = [];
	
		// Need to take account of custom filtering functions - always filter
		if ( DataTable.ext.search.length !== 0 ) {
			force = true;
		}
	
		// Check if any of the rows were invalidated
		invalidated = _fnFilterData( settings );
	
		// If the input is blank - we just want the full data set
		if ( input.length <= 0 ) {
			settings.aiDisplay = displayMaster.slice();
		}
		else {
			// New search - start from the master array
			if ( invalidated ||
				 force ||
				 regex ||
				 prevSearch.length > input.length ||
				 input.indexOf(prevSearch) !== 0 ||
				 settings.bSorted // On resort, the display master needs to be
				                  // re-filtered since indexes will have changed
			) {
				settings.aiDisplay = displayMaster.slice();
			}
	
			// Search the display array
			display = settings.aiDisplay;
	
			for ( i=0 ; i<display.length ; i++ ) {
				if ( rpSearch.test( settings.aoData[ display[i] ]._sFilterRow ) ) {
					filtered.push( display[i] );
				}
			}
	
			settings.aiDisplay = filtered;
		}
	}
	
	
	/**
	 * Build a regular expression object suitable for searching a table
	 *  @param {string} sSearch string to search for
	 *  @param {bool} bRegex treat as a regular expression or not
	 *  @param {bool} bSmart perform smart filtering or not
	 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
	 *  @returns {RegExp} constructed object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCreateSearch( search, regex, smart, caseInsensitive )
	{
		search = regex ?
			search :
			_fnEscapeRegex( search );
		
		if ( smart ) {
			/* For smart filtering we want to allow the search to work regardless of
			 * word order. We also want double quoted text to be preserved, so word
			 * order is important - a la google. So this is what we want to
			 * generate:
			 * 
			 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
			 */
			var a = $.map( search.match( /"[^"]+"|[^ ]+/g ) || [''], function ( word ) {
				if ( word.charAt(0) === '"' ) {
					var m = word.match( /^"(.*)"$/ );
					word = m ? m[1] : word;
				}
	
				return word.replace('"', '');
			} );
	
			search = '^(?=.*?'+a.join( ')(?=.*?' )+').*$';
		}
	
		return new RegExp( search, caseInsensitive ? 'i' : '' );
	}
	
	
	/**
	 * Escape a string such that it can be used in a regular expression
	 *  @param {string} sVal string to escape
	 *  @returns {string} escaped string
	 *  @memberof DataTable#oApi
	 */
	var _fnEscapeRegex = DataTable.util.escapeRegex;
	
	var __filter_div = $('<div>')[0];
	var __filter_div_textContent = __filter_div.textContent !== undefined;
	
	// Update the filtering data for each row if needed (by invalidation or first run)
	function _fnFilterData ( settings )
	{
		var columns = settings.aoColumns;
		var column;
		var i, j, ien, jen, filterData, cellData, row;
		var fomatters = DataTable.ext.type.search;
		var wasInvalidated = false;
	
		for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
			row = settings.aoData[i];
	
			if ( ! row._aFilterData ) {
				filterData = [];
	
				for ( j=0, jen=columns.length ; j<jen ; j++ ) {
					column = columns[j];
	
					if ( column.bSearchable ) {
						cellData = _fnGetCellData( settings, i, j, 'filter' );
	
						if ( fomatters[ column.sType ] ) {
							cellData = fomatters[ column.sType ]( cellData );
						}
	
						// Search in DataTables 1.10 is string based. In 1.11 this
						// should be altered to also allow strict type checking.
						if ( cellData === null ) {
							cellData = '';
						}
	
						if ( typeof cellData !== 'string' && cellData.toString ) {
							cellData = cellData.toString();
						}
					}
					else {
						cellData = '';
					}
	
					// If it looks like there is an HTML entity in the string,
					// attempt to decode it so sorting works as expected. Note that
					// we could use a single line of jQuery to do this, but the DOM
					// method used here is much faster http://jsperf.com/html-decode
					if ( cellData.indexOf && cellData.indexOf('&') !== -1 ) {
						__filter_div.innerHTML = cellData;
						cellData = __filter_div_textContent ?
							__filter_div.textContent :
							__filter_div.innerText;
					}
	
					if ( cellData.replace ) {
						cellData = cellData.replace(/[\r\n\u2028]/g, '');
					}
	
					filterData.push( cellData );
				}
	
				row._aFilterData = filterData;
				row._sFilterRow = filterData.join('  ');
				wasInvalidated = true;
			}
		}
	
		return wasInvalidated;
	}
	
	
	/**
	 * Convert from the internal Hungarian notation to camelCase for external
	 * interaction
	 *  @param {object} obj Object to convert
	 *  @returns {object} Inverted object
	 *  @memberof DataTable#oApi
	 */
	function _fnSearchToCamel ( obj )
	{
		return {
			search:          obj.sSearch,
			smart:           obj.bSmart,
			regex:           obj.bRegex,
			caseInsensitive: obj.bCaseInsensitive
		};
	}
	
	
	
	/**
	 * Convert from camelCase notation to the internal Hungarian. We could use the
	 * Hungarian convert function here, but this is cleaner
	 *  @param {object} obj Object to convert
	 *  @returns {object} Inverted object
	 *  @memberof DataTable#oApi
	 */
	function _fnSearchToHung ( obj )
	{
		return {
			sSearch:          obj.search,
			bSmart:           obj.smart,
			bRegex:           obj.regex,
			bCaseInsensitive: obj.caseInsensitive
		};
	}
	
	/**
	 * Generate the node required for the info display
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {node} Information element
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlInfo ( settings )
	{
		var
			tid = settings.sTableId,
			nodes = settings.aanFeatures.i,
			n = $('<div/>', {
				'class': settings.oClasses.sInfo,
				'id': ! nodes ? tid+'_info' : null
			} );
	
		if ( ! nodes ) {
			// Update display on each draw
			settings.aoDrawCallback.push( {
				"fn": _fnUpdateInfo,
				"sName": "information"
			} );
	
			n
				.attr( 'role', 'status' )
				.attr( 'aria-live', 'polite' );
	
			// Table is described by our info div
			$(settings.nTable).attr( 'aria-describedby', tid+'_info' );
		}
	
		return n[0];
	}
	
	
	/**
	 * Update the information elements in the display
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnUpdateInfo ( settings )
	{
		/* Show information about the table */
		var nodes = settings.aanFeatures.i;
		if ( nodes.length === 0 ) {
			return;
		}
	
		var
			lang  = settings.oLanguage,
			start = settings._iDisplayStart+1,
			end   = settings.fnDisplayEnd(),
			max   = settings.fnRecordsTotal(),
			total = settings.fnRecordsDisplay(),
			out   = total ?
				lang.sInfo :
				lang.sInfoEmpty;
	
		if ( total !== max ) {
			/* Record set after filtering */
			out += ' ' + lang.sInfoFiltered;
		}
	
		// Convert the macros
		out += lang.sInfoPostFix;
		out = _fnInfoMacros( settings, out );
	
		var callback = lang.fnInfoCallback;
		if ( callback !== null ) {
			out = callback.call( settings.oInstance,
				settings, start, end, max, total, out
			);
		}
	
		$(nodes).html( out );
	}
	
	
	function _fnInfoMacros ( settings, str )
	{
		// When infinite scrolling, we are always starting at 1. _iDisplayStart is used only
		// internally
		var
			formatter  = settings.fnFormatNumber,
			start      = settings._iDisplayStart+1,
			len        = settings._iDisplayLength,
			vis        = settings.fnRecordsDisplay(),
			all        = len === -1;
	
		return str.
			replace(/_START_/g, formatter.call( settings, start ) ).
			replace(/_END_/g,   formatter.call( settings, settings.fnDisplayEnd() ) ).
			replace(/_MAX_/g,   formatter.call( settings, settings.fnRecordsTotal() ) ).
			replace(/_TOTAL_/g, formatter.call( settings, vis ) ).
			replace(/_PAGE_/g,  formatter.call( settings, all ? 1 : Math.ceil( start / len ) ) ).
			replace(/_PAGES_/g, formatter.call( settings, all ? 1 : Math.ceil( vis / len ) ) );
	}
	
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitialise ( settings )
	{
		var i, iLen, iAjaxStart=settings.iInitDisplayStart;
		var columns = settings.aoColumns, column;
		var features = settings.oFeatures;
		var deferLoading = settings.bDeferLoading; // value modified by the draw
	
		/* Ensure that the table data is fully initialised */
		if ( ! settings.bInitialised ) {
			setTimeout( function(){ _fnInitialise( settings ); }, 200 );
			return;
		}
	
		/* Show the display HTML options */
		_fnAddOptionsHtml( settings );
	
		/* Build and draw the header / footer for the table */
		_fnBuildHead( settings );
		_fnDrawHead( settings, settings.aoHeader );
		_fnDrawHead( settings, settings.aoFooter );
	
		/* Okay to show that something is going on now */
		_fnProcessingDisplay( settings, true );
	
		/* Calculate sizes for columns */
		if ( features.bAutoWidth ) {
			_fnCalculateColumnWidths( settings );
		}
	
		for ( i=0, iLen=columns.length ; i<iLen ; i++ ) {
			column = columns[i];
	
			if ( column.sWidth ) {
				column.nTh.style.width = _fnStringToCss( column.sWidth );
			}
		}
	
		_fnCallbackFire( settings, null, 'preInit', [settings] );
	
		// If there is default sorting required - let's do it. The sort function
		// will do the drawing for us. Otherwise we draw the table regardless of the
		// Ajax source - this allows the table to look initialised for Ajax sourcing
		// data (show 'loading' message possibly)
		_fnReDraw( settings );
	
		// Server-side processing init complete is done by _fnAjaxUpdateDraw
		var dataSrc = _fnDataSource( settings );
		if ( dataSrc != 'ssp' || deferLoading ) {
			// if there is an ajax source load the data
			if ( dataSrc == 'ajax' ) {
				_fnBuildAjax( settings, [], function(json) {
					var aData = _fnAjaxDataSrc( settings, json );
	
					// Got the data - add it to the table
					for ( i=0 ; i<aData.length ; i++ ) {
						_fnAddData( settings, aData[i] );
					}
	
					// Reset the init display for cookie saving. We've already done
					// a filter, and therefore cleared it before. So we need to make
					// it appear 'fresh'
					settings.iInitDisplayStart = iAjaxStart;
	
					_fnReDraw( settings );
	
					_fnProcessingDisplay( settings, false );
					_fnInitComplete( settings, json );
				}, settings );
			}
			else {
				_fnProcessingDisplay( settings, false );
				_fnInitComplete( settings );
			}
		}
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} [json] JSON from the server that completed the table, if using Ajax source
	 *    with client-side processing (optional)
	 *  @memberof DataTable#oApi
	 */
	function _fnInitComplete ( settings, json )
	{
		settings._bInitComplete = true;
	
		// When data was added after the initialisation (data or Ajax) we need to
		// calculate the column sizing
		if ( json || settings.oInit.aaData ) {
			_fnAdjustColumnSizing( settings );
		}
	
		_fnCallbackFire( settings, null, 'plugin-init', [settings, json] );
		_fnCallbackFire( settings, 'aoInitComplete', 'init', [settings, json] );
	}
	
	
	function _fnLengthChange ( settings, val )
	{
		var len = parseInt( val, 10 );
		settings._iDisplayLength = len;
	
		_fnLengthOverflow( settings );
	
		// Fire length change event
		_fnCallbackFire( settings, null, 'length', [settings, len] );
	}
	
	
	/**
	 * Generate the node required for user display length changing
	 *  @param {object} settings dataTables settings object
	 *  @returns {node} Display length feature node
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlLength ( settings )
	{
		var
			classes  = settings.oClasses,
			tableId  = settings.sTableId,
			menu     = settings.aLengthMenu,
			d2       = Array.isArray( menu[0] ),
			lengths  = d2 ? menu[0] : menu,
			language = d2 ? menu[1] : menu;
	
		var select = $('<select/>', {
			'name':          tableId+'_length',
			'aria-controls': tableId,
			'class':         classes.sLengthSelect
		} );
	
		for ( var i=0, ien=lengths.length ; i<ien ; i++ ) {
			select[0][ i ] = new Option(
				typeof language[i] === 'number' ?
					settings.fnFormatNumber( language[i] ) :
					language[i],
				lengths[i]
			);
		}
	
		var div = $('<div><label/></div>').addClass( classes.sLength );
		if ( ! settings.aanFeatures.l ) {
			div[0].id = tableId+'_length';
		}
	
		div.children().append(
			settings.oLanguage.sLengthMenu.replace( '_MENU_', select[0].outerHTML )
		);
	
		// Can't use `select` variable as user might provide their own and the
		// reference is broken by the use of outerHTML
		$('select', div)
			.val( settings._iDisplayLength )
			.on( 'change.DT', function(e) {
				_fnLengthChange( settings, $(this).val() );
				_fnDraw( settings );
			} );
	
		// Update node value whenever anything changes the table's length
		$(settings.nTable).on( 'length.dt.DT', function (e, s, len) {
			if ( settings === s ) {
				$('select', div).val( len );
			}
		} );
	
		return div[0];
	}
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Note that most of the paging logic is done in
	 * DataTable.ext.pager
	 */
	
	/**
	 * Generate the node required for default pagination
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {node} Pagination feature node
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlPaginate ( settings )
	{
		var
			type   = settings.sPaginationType,
			plugin = DataTable.ext.pager[ type ],
			modern = typeof plugin === 'function',
			redraw = function( settings ) {
				_fnDraw( settings );
			},
			node = $('<div/>').addClass( settings.oClasses.sPaging + type )[0],
			features = settings.aanFeatures;
	
		if ( ! modern ) {
			plugin.fnInit( settings, node, redraw );
		}
	
		/* Add a draw callback for the pagination on first instance, to update the paging display */
		if ( ! features.p )
		{
			node.id = settings.sTableId+'_paginate';
	
			settings.aoDrawCallback.push( {
				"fn": function( settings ) {
					if ( modern ) {
						var
							start      = settings._iDisplayStart,
							len        = settings._iDisplayLength,
							visRecords = settings.fnRecordsDisplay(),
							all        = len === -1,
							page = all ? 0 : Math.ceil( start / len ),
							pages = all ? 1 : Math.ceil( visRecords / len ),
							buttons = plugin(page, pages),
							i, ien;
	
						for ( i=0, ien=features.p.length ; i<ien ; i++ ) {
							_fnRenderer( settings, 'pageButton' )(
								settings, features.p[i], i, buttons, page, pages
							);
						}
					}
					else {
						plugin.fnUpdate( settings, redraw );
					}
				},
				"sName": "pagination"
			} );
		}
	
		return node;
	}
	
	
	/**
	 * Alter the display settings to change the page
	 *  @param {object} settings DataTables settings object
	 *  @param {string|int} action Paging action to take: "first", "previous",
	 *    "next" or "last" or page number to jump to (integer)
	 *  @param [bool] redraw Automatically draw the update or not
	 *  @returns {bool} true page has changed, false - no change
	 *  @memberof DataTable#oApi
	 */
	function _fnPageChange ( settings, action, redraw )
	{
		var
			start     = settings._iDisplayStart,
			len       = settings._iDisplayLength,
			records   = settings.fnRecordsDisplay();
	
		if ( records === 0 || len === -1 )
		{
			start = 0;
		}
		else if ( typeof action === "number" )
		{
			start = action * len;
	
			if ( start > records )
			{
				start = 0;
			}
		}
		else if ( action == "first" )
		{
			start = 0;
		}
		else if ( action == "previous" )
		{
			start = len >= 0 ?
				start - len :
				0;
	
			if ( start < 0 )
			{
			  start = 0;
			}
		}
		else if ( action == "next" )
		{
			if ( start + len < records )
			{
				start += len;
			}
		}
		else if ( action == "last" )
		{
			start = Math.floor( (records-1) / len) * len;
		}
		else
		{
			_fnLog( settings, 0, "Unknown paging action: "+action, 5 );
		}
	
		var changed = settings._iDisplayStart !== start;
		settings._iDisplayStart = start;
	
		if ( changed ) {
			_fnCallbackFire( settings, null, 'page', [settings] );
	
			if ( redraw ) {
				_fnDraw( settings );
			}
		}
	
		return changed;
	}
	
	
	
	/**
	 * Generate the node required for the processing node
	 *  @param {object} settings dataTables settings object
	 *  @returns {node} Processing element
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlProcessing ( settings )
	{
		return $('<div/>', {
				'id': ! settings.aanFeatures.r ? settings.sTableId+'_processing' : null,
				'class': settings.oClasses.sProcessing
			} )
			.html( settings.oLanguage.sProcessing )
			.insertBefore( settings.nTable )[0];
	}
	
	
	/**
	 * Display or hide the processing indicator
	 *  @param {object} settings dataTables settings object
	 *  @param {bool} show Show the processing indicator (true) or not (false)
	 *  @memberof DataTable#oApi
	 */
	function _fnProcessingDisplay ( settings, show )
	{
		if ( settings.oFeatures.bProcessing ) {
			$(settings.aanFeatures.r).css( 'display', show ? 'block' : 'none' );
		}
	
		_fnCallbackFire( settings, null, 'processing', [settings, show] );
	}
	
	/**
	 * Add any control elements for the table - specifically scrolling
	 *  @param {object} settings dataTables settings object
	 *  @returns {node} Node to add to the DOM
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlTable ( settings )
	{
		var table = $(settings.nTable);
	
		// Add the ARIA grid role to the table
		table.attr( 'role', 'grid' );
	
		// Scrolling from here on in
		var scroll = settings.oScroll;
	
		if ( scroll.sX === '' && scroll.sY === '' ) {
			return settings.nTable;
		}
	
		var scrollX = scroll.sX;
		var scrollY = scroll.sY;
		var classes = settings.oClasses;
		var caption = table.children('caption');
		var captionSide = caption.length ? caption[0]._captionSide : null;
		var headerClone = $( table[0].cloneNode(false) );
		var footerClone = $( table[0].cloneNode(false) );
		var footer = table.children('tfoot');
		var _div = '<div/>';
		var size = function ( s ) {
			return !s ? null : _fnStringToCss( s );
		};
	
		if ( ! footer.length ) {
			footer = null;
		}
	
		/*
		 * The HTML structure that we want to generate in this function is:
		 *  div - scroller
		 *    div - scroll head
		 *      div - scroll head inner
		 *        table - scroll head table
		 *          thead - thead
		 *    div - scroll body
		 *      table - table (master table)
		 *        thead - thead clone for sizing
		 *        tbody - tbody
		 *    div - scroll foot
		 *      div - scroll foot inner
		 *        table - scroll foot table
		 *          tfoot - tfoot
		 */
		var scroller = $( _div, { 'class': classes.sScrollWrapper } )
			.append(
				$(_div, { 'class': classes.sScrollHead } )
					.css( {
						overflow: 'hidden',
						position: 'relative',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.sScrollHeadInner } )
							.css( {
								'box-sizing': 'content-box',
								width: scroll.sXInner || '100%'
							} )
							.append(
								headerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'top' ? caption : null )
									.append(
										table.children('thead')
									)
							)
					)
			)
			.append(
				$(_div, { 'class': classes.sScrollBody } )
					.css( {
						position: 'relative',
						overflow: 'auto',
						width: size( scrollX )
					} )
					.append( table )
			);
	
		if ( footer ) {
			scroller.append(
				$(_div, { 'class': classes.sScrollFoot } )
					.css( {
						overflow: 'hidden',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.sScrollFootInner } )
							.append(
								footerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'bottom' ? caption : null )
									.append(
										table.children('tfoot')
									)
							)
					)
			);
		}
	
		var children = scroller.children();
		var scrollHead = children[0];
		var scrollBody = children[1];
		var scrollFoot = footer ? children[2] : null;
	
		// When the body is scrolled, then we also want to scroll the headers
		if ( scrollX ) {
			$(scrollBody).on( 'scroll.DT', function (e) {
				var scrollLeft = this.scrollLeft;
	
				scrollHead.scrollLeft = scrollLeft;
	
				if ( footer ) {
					scrollFoot.scrollLeft = scrollLeft;
				}
			} );
		}
	
		$(scrollBody).css('max-height', scrollY);
		if (! scroll.bCollapse) {
			$(scrollBody).css('height', scrollY);
		}
	
		settings.nScrollHead = scrollHead;
		settings.nScrollBody = scrollBody;
		settings.nScrollFoot = scrollFoot;
	
		// On redraw - align columns
		settings.aoDrawCallback.push( {
			"fn": _fnScrollDraw,
			"sName": "scrolling"
		} );
	
		return scroller[0];
	}
	
	
	
	/**
	 * Update the header, footer and body tables for resizing - i.e. column
	 * alignment.
	 *
	 * Welcome to the most horrible function DataTables. The process that this
	 * function follows is basically:
	 *   1. Re-create the table inside the scrolling div
	 *   2. Take live measurements from the DOM
	 *   3. Apply the measurements to align the columns
	 *   4. Clean up
	 *
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnScrollDraw ( settings )
	{
		// Given that this is such a monster function, a lot of variables are use
		// to try and keep the minimised size as small as possible
		var
			scroll         = settings.oScroll,
			scrollX        = scroll.sX,
			scrollXInner   = scroll.sXInner,
			scrollY        = scroll.sY,
			barWidth       = scroll.iBarWidth,
			divHeader      = $(settings.nScrollHead),
			divHeaderStyle = divHeader[0].style,
			divHeaderInner = divHeader.children('div'),
			divHeaderInnerStyle = divHeaderInner[0].style,
			divHeaderTable = divHeaderInner.children('table'),
			divBodyEl      = settings.nScrollBody,
			divBody        = $(divBodyEl),
			divBodyStyle   = divBodyEl.style,
			divFooter      = $(settings.nScrollFoot),
			divFooterInner = divFooter.children('div'),
			divFooterTable = divFooterInner.children('table'),
			header         = $(settings.nTHead),
			table          = $(settings.nTable),
			tableEl        = table[0],
			tableStyle     = tableEl.style,
			footer         = settings.nTFoot ? $(settings.nTFoot) : null,
			browser        = settings.oBrowser,
			ie67           = browser.bScrollOversize,
			dtHeaderCells  = _pluck( settings.aoColumns, 'nTh' ),
			headerTrgEls, footerTrgEls,
			headerSrcEls, footerSrcEls,
			headerCopy, footerCopy,
			headerWidths=[], footerWidths=[],
			headerContent=[], footerContent=[],
			idx, correction, sanityWidth,
			zeroOut = function(nSizer) {
				var style = nSizer.style;
				style.paddingTop = "0";
				style.paddingBottom = "0";
				style.borderTopWidth = "0";
				style.borderBottomWidth = "0";
				style.height = 0;
			};
	
		// If the scrollbar visibility has changed from the last draw, we need to
		// adjust the column sizes as the table width will have changed to account
		// for the scrollbar
		var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
		
		if ( settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined ) {
			settings.scrollBarVis = scrollBarVis;
			_fnAdjustColumnSizing( settings );
			return; // adjust column sizing will call this function again
		}
		else {
			settings.scrollBarVis = scrollBarVis;
		}
	
		/*
		 * 1. Re-create the table inside the scrolling div
		 */
	
		// Remove the old minimised thead and tfoot elements in the inner table
		table.children('thead, tfoot').remove();
	
		if ( footer ) {
			footerCopy = footer.clone().prependTo( table );
			footerTrgEls = footer.find('tr'); // the original tfoot is in its own table and must be sized
			footerSrcEls = footerCopy.find('tr');
		}
	
		// Clone the current header and footer elements and then place it into the inner table
		headerCopy = header.clone().prependTo( table );
		headerTrgEls = header.find('tr'); // original header is in its own table
		headerSrcEls = headerCopy.find('tr');
		headerCopy.find('th, td').removeAttr('tabindex');
	
	
		/*
		 * 2. Take live measurements from the DOM - do not alter the DOM itself!
		 */
	
		// Remove old sizing and apply the calculated column widths
		// Get the unique column headers in the newly created (cloned) header. We want to apply the
		// calculated sizes to this header
		if ( ! scrollX )
		{
			divBodyStyle.width = '100%';
			divHeader[0].style.width = '100%';
		}
	
		$.each( _fnGetUniqueThs( settings, headerCopy ), function ( i, el ) {
			idx = _fnVisibleToColumnIndex( settings, i );
			el.style.width = settings.aoColumns[idx].sWidth;
		} );
	
		if ( footer ) {
			_fnApplyToChildren( function(n) {
				n.style.width = "";
			}, footerSrcEls );
		}
	
		// Size the table as a whole
		sanityWidth = table.outerWidth();
		if ( scrollX === "" ) {
			// No x scrolling
			tableStyle.width = "100%";
	
			// IE7 will make the width of the table when 100% include the scrollbar
			// - which is shouldn't. When there is a scrollbar we need to take this
			// into account.
			if ( ie67 && (table.find('tbody').height() > divBodyEl.offsetHeight ||
				divBody.css('overflow-y') == "scroll")
			) {
				tableStyle.width = _fnStringToCss( table.outerWidth() - barWidth);
			}
	
			// Recalculate the sanity width
			sanityWidth = table.outerWidth();
		}
		else if ( scrollXInner !== "" ) {
			// legacy x scroll inner has been given - use it
			tableStyle.width = _fnStringToCss(scrollXInner);
	
			// Recalculate the sanity width
			sanityWidth = table.outerWidth();
		}
	
		// Hidden header should have zero height, so remove padding and borders. Then
		// set the width based on the real headers
	
		// Apply all styles in one pass
		_fnApplyToChildren( zeroOut, headerSrcEls );
	
		// Read all widths in next pass
		_fnApplyToChildren( function(nSizer) {
			headerContent.push( nSizer.innerHTML );
			headerWidths.push( _fnStringToCss( $(nSizer).css('width') ) );
		}, headerSrcEls );
	
		// Apply all widths in final pass
		_fnApplyToChildren( function(nToSize, i) {
			// Only apply widths to the DataTables detected header cells - this
			// prevents complex headers from having contradictory sizes applied
			if ( $.inArray( nToSize, dtHeaderCells ) !== -1 ) {
				nToSize.style.width = headerWidths[i];
			}
		}, headerTrgEls );
	
		$(headerSrcEls).height(0);
	
		/* Same again with the footer if we have one */
		if ( footer )
		{
			_fnApplyToChildren( zeroOut, footerSrcEls );
	
			_fnApplyToChildren( function(nSizer) {
				footerContent.push( nSizer.innerHTML );
				footerWidths.push( _fnStringToCss( $(nSizer).css('width') ) );
			}, footerSrcEls );
	
			_fnApplyToChildren( function(nToSize, i) {
				nToSize.style.width = footerWidths[i];
			}, footerTrgEls );
	
			$(footerSrcEls).height(0);
		}
	
	
		/*
		 * 3. Apply the measurements
		 */
	
		// "Hide" the header and footer that we used for the sizing. We need to keep
		// the content of the cell so that the width applied to the header and body
		// both match, but we want to hide it completely. We want to also fix their
		// width to what they currently are
		_fnApplyToChildren( function(nSizer, i) {
			nSizer.innerHTML = '<div class="dataTables_sizing">'+headerContent[i]+'</div>';
			nSizer.childNodes[0].style.height = "0";
			nSizer.childNodes[0].style.overflow = "hidden";
			nSizer.style.width = headerWidths[i];
		}, headerSrcEls );
	
		if ( footer )
		{
			_fnApplyToChildren( function(nSizer, i) {
				nSizer.innerHTML = '<div class="dataTables_sizing">'+footerContent[i]+'</div>';
				nSizer.childNodes[0].style.height = "0";
				nSizer.childNodes[0].style.overflow = "hidden";
				nSizer.style.width = footerWidths[i];
			}, footerSrcEls );
		}
	
		// Sanity check that the table is of a sensible width. If not then we are going to get
		// misalignment - try to prevent this by not allowing the table to shrink below its min width
		if ( table.outerWidth() < sanityWidth )
		{
			// The min width depends upon if we have a vertical scrollbar visible or not */
			correction = ((divBodyEl.scrollHeight > divBodyEl.offsetHeight ||
				divBody.css('overflow-y') == "scroll")) ?
					sanityWidth+barWidth :
					sanityWidth;
	
			// IE6/7 are a law unto themselves...
			if ( ie67 && (divBodyEl.scrollHeight >
				divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")
			) {
				tableStyle.width = _fnStringToCss( correction-barWidth );
			}
	
			// And give the user a warning that we've stopped the table getting too small
			if ( scrollX === "" || scrollXInner !== "" ) {
				_fnLog( settings, 1, 'Possible column misalignment', 6 );
			}
		}
		else
		{
			correction = '100%';
		}
	
		// Apply to the container elements
		divBodyStyle.width = _fnStringToCss( correction );
		divHeaderStyle.width = _fnStringToCss( correction );
	
		if ( footer ) {
			settings.nScrollFoot.style.width = _fnStringToCss( correction );
		}
	
	
		/*
		 * 4. Clean up
		 */
		if ( ! scrollY ) {
			/* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
			 * the scrollbar height from the visible display, rather than adding it on. We need to
			 * set the height in order to sort this. Don't want to do it in any other browsers.
			 */
			if ( ie67 ) {
				divBodyStyle.height = _fnStringToCss( tableEl.offsetHeight+barWidth );
			}
		}
	
		/* Finally set the width's of the header and footer tables */
		var iOuterWidth = table.outerWidth();
		divHeaderTable[0].style.width = _fnStringToCss( iOuterWidth );
		divHeaderInnerStyle.width = _fnStringToCss( iOuterWidth );
	
		// Figure out if there are scrollbar present - if so then we need a the header and footer to
		// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
		var bScrolling = table.height() > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
		var padding = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
		divHeaderInnerStyle[ padding ] = bScrolling ? barWidth+"px" : "0px";
	
		if ( footer ) {
			divFooterTable[0].style.width = _fnStringToCss( iOuterWidth );
			divFooterInner[0].style.width = _fnStringToCss( iOuterWidth );
			divFooterInner[0].style[padding] = bScrolling ? barWidth+"px" : "0px";
		}
	
		// Correct DOM ordering for colgroup - comes before the thead
		table.children('colgroup').insertBefore( table.children('thead') );
	
		/* Adjust the position of the header in case we loose the y-scrollbar */
		divBody.trigger('scroll');
	
		// If sorting or filtering has occurred, jump the scrolling back to the top
		// only if we aren't holding the position
		if ( (settings.bSorted || settings.bFiltered) && ! settings._drawHold ) {
			divBodyEl.scrollTop = 0;
		}
	}
	
	
	
	/**
	 * Apply a given function to the display child nodes of an element array (typically
	 * TD children of TR rows
	 *  @param {function} fn Method to apply to the objects
	 *  @param array {nodes} an1 List of elements to look through for display children
	 *  @param array {nodes} an2 Another list (identical structure to the first) - optional
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyToChildren( fn, an1, an2 )
	{
		var index=0, i=0, iLen=an1.length;
		var nNode1, nNode2;
	
		while ( i < iLen ) {
			nNode1 = an1[i].firstChild;
			nNode2 = an2 ? an2[i].firstChild : null;
	
			while ( nNode1 ) {
				if ( nNode1.nodeType === 1 ) {
					if ( an2 ) {
						fn( nNode1, nNode2, index );
					}
					else {
						fn( nNode1, index );
					}
	
					index++;
				}
	
				nNode1 = nNode1.nextSibling;
				nNode2 = an2 ? nNode2.nextSibling : null;
			}
	
			i++;
		}
	}
	
	
	
	var __re_html_remove = /<.*?>/g;
	
	
	/**
	 * Calculate the width of columns for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnCalculateColumnWidths ( oSettings )
	{
		var
			table = oSettings.nTable,
			columns = oSettings.aoColumns,
			scroll = oSettings.oScroll,
			scrollY = scroll.sY,
			scrollX = scroll.sX,
			scrollXInner = scroll.sXInner,
			columnCount = columns.length,
			visibleColumns = _fnGetColumns( oSettings, 'bVisible' ),
			headerCells = $('th', oSettings.nTHead),
			tableWidthAttr = table.getAttribute('width'), // from DOM element
			tableContainer = table.parentNode,
			userInputs = false,
			i, column, columnIdx, width, outerWidth,
			browser = oSettings.oBrowser,
			ie67 = browser.bScrollOversize;
	
		var styleWidth = table.style.width;
		if ( styleWidth && styleWidth.indexOf('%') !== -1 ) {
			tableWidthAttr = styleWidth;
		}
	
		/* Convert any user input sizes into pixel sizes */
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			column = columns[ visibleColumns[i] ];
	
			if ( column.sWidth !== null ) {
				column.sWidth = _fnConvertToWidth( column.sWidthOrig, tableContainer );
	
				userInputs = true;
			}
		}
	
		/* If the number of columns in the DOM equals the number that we have to
		 * process in DataTables, then we can use the offsets that are created by
		 * the web- browser. No custom sizes can be set in order for this to happen,
		 * nor scrolling used
		 */
		if ( ie67 || ! userInputs && ! scrollX && ! scrollY &&
		     columnCount == _fnVisbleColumns( oSettings ) &&
		     columnCount == headerCells.length
		) {
			for ( i=0 ; i<columnCount ; i++ ) {
				var colIdx = _fnVisibleToColumnIndex( oSettings, i );
	
				if ( colIdx !== null ) {
					columns[ colIdx ].sWidth = _fnStringToCss( headerCells.eq(i).width() );
				}
			}
		}
		else
		{
			// Otherwise construct a single row, worst case, table with the widest
			// node in the data, assign any user defined widths, then insert it into
			// the DOM and allow the browser to do all the hard work of calculating
			// table widths
			var tmpTable = $(table).clone() // don't use cloneNode - IE8 will remove events on the main table
				.css( 'visibility', 'hidden' )
				.removeAttr( 'id' );
	
			// Clean up the table body
			tmpTable.find('tbody tr').remove();
			var tr = $('<tr/>').appendTo( tmpTable.find('tbody') );
	
			// Clone the table header and footer - we can't use the header / footer
			// from the cloned table, since if scrolling is active, the table's
			// real header and footer are contained in different table tags
			tmpTable.find('thead, tfoot').remove();
			tmpTable
				.append( $(oSettings.nTHead).clone() )
				.append( $(oSettings.nTFoot).clone() );
	
			// Remove any assigned widths from the footer (from scrolling)
			tmpTable.find('tfoot th, tfoot td').css('width', '');
	
			// Apply custom sizing to the cloned header
			headerCells = _fnGetUniqueThs( oSettings, tmpTable.find('thead')[0] );
	
			for ( i=0 ; i<visibleColumns.length ; i++ ) {
				column = columns[ visibleColumns[i] ];
	
				headerCells[i].style.width = column.sWidthOrig !== null && column.sWidthOrig !== '' ?
					_fnStringToCss( column.sWidthOrig ) :
					'';
	
				// For scrollX we need to force the column width otherwise the
				// browser will collapse it. If this width is smaller than the
				// width the column requires, then it will have no effect
				if ( column.sWidthOrig && scrollX ) {
					$( headerCells[i] ).append( $('<div/>').css( {
						width: column.sWidthOrig,
						margin: 0,
						padding: 0,
						border: 0,
						height: 1
					} ) );
				}
			}
	
			// Find the widest cell for each column and put it into the table
			if ( oSettings.aoData.length ) {
				for ( i=0 ; i<visibleColumns.length ; i++ ) {
					columnIdx = visibleColumns[i];
					column = columns[ columnIdx ];
	
					$( _fnGetWidestNode( oSettings, columnIdx ) )
						.clone( false )
						.append( column.sContentPadding )
						.appendTo( tr );
				}
			}
	
			// Tidy the temporary table - remove name attributes so there aren't
			// duplicated in the dom (radio elements for example)
			$('[name]', tmpTable).removeAttr('name');
	
			// Table has been built, attach to the document so we can work with it.
			// A holding element is used, positioned at the top of the container
			// with minimal height, so it has no effect on if the container scrolls
			// or not. Otherwise it might trigger scrolling when it actually isn't
			// needed
			var holder = $('<div/>').css( scrollX || scrollY ?
					{
						position: 'absolute',
						top: 0,
						left: 0,
						height: 1,
						right: 0,
						overflow: 'hidden'
					} :
					{}
				)
				.append( tmpTable )
				.appendTo( tableContainer );
	
			// When scrolling (X or Y) we want to set the width of the table as 
			// appropriate. However, when not scrolling leave the table width as it
			// is. This results in slightly different, but I think correct behaviour
			if ( scrollX && scrollXInner ) {
				tmpTable.width( scrollXInner );
			}
			else if ( scrollX ) {
				tmpTable.css( 'width', 'auto' );
				tmpTable.removeAttr('width');
	
				// If there is no width attribute or style, then allow the table to
				// collapse
				if ( tmpTable.width() < tableContainer.clientWidth && tableWidthAttr ) {
					tmpTable.width( tableContainer.clientWidth );
				}
			}
			else if ( scrollY ) {
				tmpTable.width( tableContainer.clientWidth );
			}
			else if ( tableWidthAttr ) {
				tmpTable.width( tableWidthAttr );
			}
	
			// Get the width of each column in the constructed table - we need to
			// know the inner width (so it can be assigned to the other table's
			// cells) and the outer width so we can calculate the full width of the
			// table. This is safe since DataTables requires a unique cell for each
			// column, but if ever a header can span multiple columns, this will
			// need to be modified.
			var total = 0;
			for ( i=0 ; i<visibleColumns.length ; i++ ) {
				var cell = $(headerCells[i]);
				var border = cell.outerWidth() - cell.width();
	
				// Use getBounding... where possible (not IE8-) because it can give
				// sub-pixel accuracy, which we then want to round up!
				var bounding = browser.bBounding ?
					Math.ceil( headerCells[i].getBoundingClientRect().width ) :
					cell.outerWidth();
	
				// Total is tracked to remove any sub-pixel errors as the outerWidth
				// of the table might not equal the total given here (IE!).
				total += bounding;
	
				// Width for each column to use
				columns[ visibleColumns[i] ].sWidth = _fnStringToCss( bounding - border );
			}
	
			table.style.width = _fnStringToCss( total );
	
			// Finished with the table - ditch it
			holder.remove();
		}
	
		// If there is a width attr, we want to attach an event listener which
		// allows the table sizing to automatically adjust when the window is
		// resized. Use the width attr rather than CSS, since we can't know if the
		// CSS is a relative value or absolute - DOM read is always px.
		if ( tableWidthAttr ) {
			table.style.width = _fnStringToCss( tableWidthAttr );
		}
	
		if ( (tableWidthAttr || scrollX) && ! oSettings._reszEvt ) {
			var bindResize = function () {
				$(window).on('resize.DT-'+oSettings.sInstance, _fnThrottle( function () {
					_fnAdjustColumnSizing( oSettings );
				} ) );
			};
	
			// IE6/7 will crash if we bind a resize event handler on page load.
			// To be removed in 1.11 which drops IE6/7 support
			if ( ie67 ) {
				setTimeout( bindResize, 1000 );
			}
			else {
				bindResize();
			}
	
			oSettings._reszEvt = true;
		}
	}
	
	
	/**
	 * Throttle the calls to a function. Arguments and context are maintained for
	 * the throttled function
	 *  @param {function} fn Function to be called
	 *  @param {int} [freq=200] call frequency in mS
	 *  @returns {function} wrapped function
	 *  @memberof DataTable#oApi
	 */
	var _fnThrottle = DataTable.util.throttle;
	
	
	/**
	 * Convert a CSS unit width to pixels (e.g. 2em)
	 *  @param {string} width width to be converted
	 *  @param {node} parent parent to get the with for (required for relative widths) - optional
	 *  @returns {int} width in pixels
	 *  @memberof DataTable#oApi
	 */
	function _fnConvertToWidth ( width, parent )
	{
		if ( ! width ) {
			return 0;
		}
	
		var n = $('<div/>')
			.css( 'width', _fnStringToCss( width ) )
			.appendTo( parent || document.body );
	
		var val = n[0].offsetWidth;
		n.remove();
	
		return val;
	}
	
	
	/**
	 * Get the widest node
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {node} widest table node
	 *  @memberof DataTable#oApi
	 */
	function _fnGetWidestNode( settings, colIdx )
	{
		var idx = _fnGetMaxLenString( settings, colIdx );
		if ( idx < 0 ) {
			return null;
		}
	
		var data = settings.aoData[ idx ];
		return ! data.nTr ? // Might not have been created when deferred rendering
			$('<td/>').html( _fnGetCellData( settings, idx, colIdx, 'display' ) )[0] :
			data.anCells[ colIdx ];
	}
	
	
	/**
	 * Get the maximum strlen for each data column
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {string} max string length for each column
	 *  @memberof DataTable#oApi
	 */
	function _fnGetMaxLenString( settings, colIdx )
	{
		var s, max=-1, maxIdx = -1;
	
		for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
			s = _fnGetCellData( settings, i, colIdx, 'display' )+'';
			s = s.replace( __re_html_remove, '' );
			s = s.replace( /&nbsp;/g, ' ' );
	
			if ( s.length > max ) {
				max = s.length;
				maxIdx = i;
			}
		}
	
		return maxIdx;
	}
	
	
	/**
	 * Append a CSS unit (only if required) to a string
	 *  @param {string} value to css-ify
	 *  @returns {string} value with css unit
	 *  @memberof DataTable#oApi
	 */
	function _fnStringToCss( s )
	{
		if ( s === null ) {
			return '0px';
		}
	
		if ( typeof s == 'number' ) {
			return s < 0 ?
				'0px' :
				s+'px';
		}
	
		// Check it has a unit character already
		return s.match(/\d$/) ?
			s+'px' :
			s;
	}
	
	
	
	function _fnSortFlatten ( settings )
	{
		var
			i, iLen, k, kLen,
			aSort = [],
			aiOrig = [],
			aoColumns = settings.aoColumns,
			aDataSort, iCol, sType, srcCol,
			fixed = settings.aaSortingFixed,
			fixedObj = $.isPlainObject( fixed ),
			nestedSort = [],
			add = function ( a ) {
				if ( a.length && ! Array.isArray( a[0] ) ) {
					// 1D array
					nestedSort.push( a );
				}
				else {
					// 2D array
					$.merge( nestedSort, a );
				}
			};
	
		// Build the sort array, with pre-fix and post-fix options if they have been
		// specified
		if ( Array.isArray( fixed ) ) {
			add( fixed );
		}
	
		if ( fixedObj && fixed.pre ) {
			add( fixed.pre );
		}
	
		add( settings.aaSorting );
	
		if (fixedObj && fixed.post ) {
			add( fixed.post );
		}
	
		for ( i=0 ; i<nestedSort.length ; i++ )
		{
			srcCol = nestedSort[i][0];
			aDataSort = aoColumns[ srcCol ].aDataSort;
	
			for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
			{
				iCol = aDataSort[k];
				sType = aoColumns[ iCol ].sType || 'string';
	
				if ( nestedSort[i]._idx === undefined ) {
					nestedSort[i]._idx = $.inArray( nestedSort[i][1], aoColumns[iCol].asSorting );
				}
	
				aSort.push( {
					src:       srcCol,
					col:       iCol,
					dir:       nestedSort[i][1],
					index:     nestedSort[i]._idx,
					type:      sType,
					formatter: DataTable.ext.type.order[ sType+"-pre" ]
				} );
			}
		}
	
		return aSort;
	}
	
	/**
	 * Change the order of the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 *  @todo This really needs split up!
	 */
	function _fnSort ( oSettings )
	{
		var
			i, ien, iLen, j, jLen, k, kLen,
			sDataType, nTh,
			aiOrig = [],
			oExtSort = DataTable.ext.type.order,
			aoData = oSettings.aoData,
			aoColumns = oSettings.aoColumns,
			aDataSort, data, iCol, sType, oSort,
			formatters = 0,
			sortCol,
			displayMaster = oSettings.aiDisplayMaster,
			aSort;
	
		// Resolve any column types that are unknown due to addition or invalidation
		// @todo Can this be moved into a 'data-ready' handler which is called when
		//   data is going to be used in the table?
		_fnColumnTypes( oSettings );
	
		aSort = _fnSortFlatten( oSettings );
	
		for ( i=0, ien=aSort.length ; i<ien ; i++ ) {
			sortCol = aSort[i];
	
			// Track if we can use the fast sort algorithm
			if ( sortCol.formatter ) {
				formatters++;
			}
	
			// Load the data needed for the sort, for each cell
			_fnSortData( oSettings, sortCol.col );
		}
	
		/* No sorting required if server-side or no sorting array */
		if ( _fnDataSource( oSettings ) != 'ssp' && aSort.length !== 0 )
		{
			// Create a value - key array of the current row positions such that we can use their
			// current position during the sort, if values match, in order to perform stable sorting
			for ( i=0, iLen=displayMaster.length ; i<iLen ; i++ ) {
				aiOrig[ displayMaster[i] ] = i;
			}
	
			/* Do the sort - here we want multi-column sorting based on a given data source (column)
			 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
			 * follow on it's own, but this is what we want (example two column sorting):
			 *  fnLocalSorting = function(a,b){
			 *    var iTest;
			 *    iTest = oSort['string-asc']('data11', 'data12');
			 *      if (iTest !== 0)
			 *        return iTest;
			 *    iTest = oSort['numeric-desc']('data21', 'data22');
			 *    if (iTest !== 0)
			 *      return iTest;
			 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
			 *  }
			 * Basically we have a test for each sorting column, if the data in that column is equal,
			 * test the next column. If all columns match, then we use a numeric sort on the row
			 * positions in the original data array to provide a stable sort.
			 *
			 * Note - I know it seems excessive to have two sorting methods, but the first is around
			 * 15% faster, so the second is only maintained for backwards compatibility with sorting
			 * methods which do not have a pre-sort formatting function.
			 */
			if ( formatters === aSort.length ) {
				// All sort types have formatting functions
				displayMaster.sort( function ( a, b ) {
					var
						x, y, k, test, sort,
						len=aSort.length,
						dataA = aoData[a]._aSortData,
						dataB = aoData[b]._aSortData;
	
					for ( k=0 ; k<len ; k++ ) {
						sort = aSort[k];
	
						x = dataA[ sort.col ];
						y = dataB[ sort.col ];
	
						test = x<y ? -1 : x>y ? 1 : 0;
						if ( test !== 0 ) {
							return sort.dir === 'asc' ? test : -test;
						}
					}
	
					x = aiOrig[a];
					y = aiOrig[b];
					return x<y ? -1 : x>y ? 1 : 0;
				} );
			}
			else {
				// Depreciated - remove in 1.11 (providing a plug-in option)
				// Not all sort types have formatting methods, so we have to call their sorting
				// methods.
				displayMaster.sort( function ( a, b ) {
					var
						x, y, k, l, test, sort, fn,
						len=aSort.length,
						dataA = aoData[a]._aSortData,
						dataB = aoData[b]._aSortData;
	
					for ( k=0 ; k<len ; k++ ) {
						sort = aSort[k];
	
						x = dataA[ sort.col ];
						y = dataB[ sort.col ];
	
						fn = oExtSort[ sort.type+"-"+sort.dir ] || oExtSort[ "string-"+sort.dir ];
						test = fn( x, y );
						if ( test !== 0 ) {
							return test;
						}
					}
	
					x = aiOrig[a];
					y = aiOrig[b];
					return x<y ? -1 : x>y ? 1 : 0;
				} );
			}
		}
	
		/* Tell the draw function that we have sorted the data */
		oSettings.bSorted = true;
	}
	
	
	function _fnSortAria ( settings )
	{
		var label;
		var nextSort;
		var columns = settings.aoColumns;
		var aSort = _fnSortFlatten( settings );
		var oAria = settings.oLanguage.oAria;
	
		// ARIA attributes - need to loop all columns, to update all (removing old
		// attributes as needed)
		for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
		{
			var col = columns[i];
			var asSorting = col.asSorting;
			var sTitle = col.ariaTitle || col.sTitle.replace( /<.*?>/g, "" );
			var th = col.nTh;
	
			// IE7 is throwing an error when setting these properties with jQuery's
			// attr() and removeAttr() methods...
			th.removeAttribute('aria-sort');
	
			/* In ARIA only the first sorting column can be marked as sorting - no multi-sort option */
			if ( col.bSortable ) {
				if ( aSort.length > 0 && aSort[0].col == i ) {
					th.setAttribute('aria-sort', aSort[0].dir=="asc" ? "ascending" : "descending" );
					nextSort = asSorting[ aSort[0].index+1 ] || asSorting[0];
				}
				else {
					nextSort = asSorting[0];
				}
	
				label = sTitle + ( nextSort === "asc" ?
					oAria.sSortAscending :
					oAria.sSortDescending
				);
			}
			else {
				label = sTitle;
			}
	
			th.setAttribute('aria-label', label);
		}
	}
	
	
	/**
	 * Function to run on user sort request
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {boolean} [append=false] Append the requested sort to the existing
	 *    sort if true (i.e. multi-column sort)
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortListener ( settings, colIdx, append, callback )
	{
		var col = settings.aoColumns[ colIdx ];
		var sorting = settings.aaSorting;
		var asSorting = col.asSorting;
		var nextSortIdx;
		var next = function ( a, overflow ) {
			var idx = a._idx;
			if ( idx === undefined ) {
				idx = $.inArray( a[1], asSorting );
			}
	
			return idx+1 < asSorting.length ?
				idx+1 :
				overflow ?
					null :
					0;
		};
	
		// Convert to 2D array if needed
		if ( typeof sorting[0] === 'number' ) {
			sorting = settings.aaSorting = [ sorting ];
		}
	
		// If appending the sort then we are multi-column sorting
		if ( append && settings.oFeatures.bSortMulti ) {
			// Are we already doing some kind of sort on this column?
			var sortIdx = $.inArray( colIdx, _pluck(sorting, '0') );
	
			if ( sortIdx !== -1 ) {
				// Yes, modify the sort
				nextSortIdx = next( sorting[sortIdx], true );
	
				if ( nextSortIdx === null && sorting.length === 1 ) {
					nextSortIdx = 0; // can't remove sorting completely
				}
	
				if ( nextSortIdx === null ) {
					sorting.splice( sortIdx, 1 );
				}
				else {
					sorting[sortIdx][1] = asSorting[ nextSortIdx ];
					sorting[sortIdx]._idx = nextSortIdx;
				}
			}
			else {
				// No sort on this column yet
				sorting.push( [ colIdx, asSorting[0], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
		}
		else if ( sorting.length && sorting[0][0] == colIdx ) {
			// Single column - already sorting on this column, modify the sort
			nextSortIdx = next( sorting[0] );
	
			sorting.length = 1;
			sorting[0][1] = asSorting[ nextSortIdx ];
			sorting[0]._idx = nextSortIdx;
		}
		else {
			// Single column - sort only on this column
			sorting.length = 0;
			sorting.push( [ colIdx, asSorting[0] ] );
			sorting[0]._idx = 0;
		}
	
		// Run the sort by calling a full redraw
		_fnReDraw( settings );
	
		// callback used for async user interaction
		if ( typeof callback == 'function' ) {
			callback( settings );
		}
	}
	
	
	/**
	 * Attach a sort handler (click) to a node
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortAttachListener ( settings, attachTo, colIdx, callback )
	{
		var col = settings.aoColumns[ colIdx ];
	
		_fnBindAction( attachTo, {}, function (e) {
			/* If the column is not sortable - don't to anything */
			if ( col.bSortable === false ) {
				return;
			}
	
			// If processing is enabled use a timeout to allow the processing
			// display to be shown - otherwise to it synchronously
			if ( settings.oFeatures.bProcessing ) {
				_fnProcessingDisplay( settings, true );
	
				setTimeout( function() {
					_fnSortListener( settings, colIdx, e.shiftKey, callback );
	
					// In server-side processing, the draw callback will remove the
					// processing display
					if ( _fnDataSource( settings ) !== 'ssp' ) {
						_fnProcessingDisplay( settings, false );
					}
				}, 0 );
			}
			else {
				_fnSortListener( settings, colIdx, e.shiftKey, callback );
			}
		} );
	}
	
	
	/**
	 * Set the sorting classes on table's body, Note: it is safe to call this function
	 * when bSort and bSortClasses are false
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSortingClasses( settings )
	{
		var oldSort = settings.aLastSort;
		var sortClass = settings.oClasses.sSortColumn;
		var sort = _fnSortFlatten( settings );
		var features = settings.oFeatures;
		var i, ien, colIdx;
	
		if ( features.bSort && features.bSortClasses ) {
			// Remove old sorting classes
			for ( i=0, ien=oldSort.length ; i<ien ; i++ ) {
				colIdx = oldSort[i].src;
	
				// Remove column sorting
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.removeClass( sortClass + (i<2 ? i+1 : 3) );
			}
	
			// Add new column sorting
			for ( i=0, ien=sort.length ; i<ien ; i++ ) {
				colIdx = sort[i].src;
	
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.addClass( sortClass + (i<2 ? i+1 : 3) );
			}
		}
	
		settings.aLastSort = sort;
	}
	
	
	// Get the data to sort a column, be it from cache, fresh (populating the
	// cache), or from a sort formatter
	function _fnSortData( settings, idx )
	{
		// Custom sorting function - provided by the sort data type
		var column = settings.aoColumns[ idx ];
		var customSort = DataTable.ext.order[ column.sSortDataType ];
		var customData;
	
		if ( customSort ) {
			customData = customSort.call( settings.oInstance, settings, idx,
				_fnColumnIndexToVisible( settings, idx )
			);
		}
	
		// Use / populate cache
		var row, cellData;
		var formatter = DataTable.ext.type.order[ column.sType+"-pre" ];
	
		for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
			row = settings.aoData[i];
	
			if ( ! row._aSortData ) {
				row._aSortData = [];
			}
	
			if ( ! row._aSortData[idx] || customSort ) {
				cellData = customSort ?
					customData[i] : // If there was a custom sort function, use data from there
					_fnGetCellData( settings, i, idx, 'sort' );
	
				row._aSortData[ idx ] = formatter ?
					formatter( cellData ) :
					cellData;
			}
		}
	}
	
	
	
	/**
	 * Save the state of a table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSaveState ( settings )
	{
		if ( !settings.oFeatures.bStateSave || settings.bDestroying )
		{
			return;
		}
	
		/* Store the interesting variables */
		var state = {
			time:    +new Date(),
			start:   settings._iDisplayStart,
			length:  settings._iDisplayLength,
			order:   $.extend( true, [], settings.aaSorting ),
			search:  _fnSearchToCamel( settings.oPreviousSearch ),
			columns: $.map( settings.aoColumns, function ( col, i ) {
				return {
					visible: col.bVisible,
					search: _fnSearchToCamel( settings.aoPreSearchCols[i] )
				};
			} )
		};
	
		_fnCallbackFire( settings, "aoStateSaveParams", 'stateSaveParams', [settings, state] );
	
		settings.oSavedState = state;
		settings.fnStateSaveCallback.call( settings.oInstance, settings, state );
	}
	
	
	/**
	 * Attempt to load a saved table state
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} oInit DataTables init object so we can override settings
	 *  @param {function} callback Callback to execute when the state has been loaded
	 *  @memberof DataTable#oApi
	 */
	function _fnLoadState ( settings, oInit, callback )
	{
		var i, ien;
		var columns = settings.aoColumns;
		var loaded = function ( s ) {
			if ( ! s || ! s.time ) {
				callback();
				return;
			}
	
			// Allow custom and plug-in manipulation functions to alter the saved data set and
			// cancelling of loading by returning false
			var abStateLoad = _fnCallbackFire( settings, 'aoStateLoadParams', 'stateLoadParams', [settings, s] );
			if ( $.inArray( false, abStateLoad ) !== -1 ) {
				callback();
				return;
			}
	
			// Reject old data
			var duration = settings.iStateDuration;
			if ( duration > 0 && s.time < +new Date() - (duration*1000) ) {
				callback();
				return;
			}
	
			// Number of columns have changed - all bets are off, no restore of settings
			if ( s.columns && columns.length !== s.columns.length ) {
				callback();
				return;
			}
	
			// Store the saved state so it might be accessed at any time
			settings.oLoadedState = $.extend( true, {}, s );
	
			// Restore key features - todo - for 1.11 this needs to be done by
			// subscribed events
			if ( s.start !== undefined ) {
				settings._iDisplayStart    = s.start;
				settings.iInitDisplayStart = s.start;
			}
			if ( s.length !== undefined ) {
				settings._iDisplayLength   = s.length;
			}
	
			// Order
			if ( s.order !== undefined ) {
				settings.aaSorting = [];
				$.each( s.order, function ( i, col ) {
					settings.aaSorting.push( col[0] >= columns.length ?
						[ 0, col[1] ] :
						col
					);
				} );
			}
	
			// Search
			if ( s.search !== undefined ) {
				$.extend( settings.oPreviousSearch, _fnSearchToHung( s.search ) );
			}
	
			// Columns
			//
			if ( s.columns ) {
				for ( i=0, ien=s.columns.length ; i<ien ; i++ ) {
					var col = s.columns[i];
	
					// Visibility
					if ( col.visible !== undefined ) {
						columns[i].bVisible = col.visible;
					}
	
					// Search
					if ( col.search !== undefined ) {
						$.extend( settings.aoPreSearchCols[i], _fnSearchToHung( col.search ) );
					}
				}
			}
	
			_fnCallbackFire( settings, 'aoStateLoaded', 'stateLoaded', [settings, s] );
			callback();
		};
	
		if ( ! settings.oFeatures.bStateSave ) {
			callback();
			return;
		}
	
		var state = settings.fnStateLoadCallback.call( settings.oInstance, settings, loaded );
	
		if ( state !== undefined ) {
			loaded( state );
		}
		// otherwise, wait for the loaded callback to be executed
	}
	
	
	/**
	 * Return the settings object for a particular table
	 *  @param {node} table table we are using as a dataTable
	 *  @returns {object} Settings object - or null if not found
	 *  @memberof DataTable#oApi
	 */
	function _fnSettingsFromNode ( table )
	{
		var settings = DataTable.settings;
		var idx = $.inArray( table, _pluck( settings, 'nTable' ) );
	
		return idx !== -1 ?
			settings[ idx ] :
			null;
	}
	
	
	/**
	 * Log an error message
	 *  @param {object} settings dataTables settings object
	 *  @param {int} level log error messages, or display them to the user
	 *  @param {string} msg error message
	 *  @param {int} tn Technical note id to get more information about the error.
	 *  @memberof DataTable#oApi
	 */
	function _fnLog( settings, level, msg, tn )
	{
		msg = 'DataTables warning: '+
			(settings ? 'table id='+settings.sTableId+' - ' : '')+msg;
	
		if ( tn ) {
			msg += '. For more information about this error, please see '+
			'http://datatables.net/tn/'+tn;
		}
	
		if ( ! level  ) {
			// Backwards compatibility pre 1.10
			var ext = DataTable.ext;
			var type = ext.sErrMode || ext.errMode;
	
			if ( settings ) {
				_fnCallbackFire( settings, null, 'error', [ settings, tn, msg ] );
			}
	
			if ( type == 'alert' ) {
				alert( msg );
			}
			else if ( type == 'throw' ) {
				throw new Error(msg);
			}
			else if ( typeof type == 'function' ) {
				type( settings, tn, msg );
			}
		}
		else if ( window.console && console.log ) {
			console.log( msg );
		}
	}
	
	
	/**
	 * See if a property is defined on one object, if so assign it to the other object
	 *  @param {object} ret target object
	 *  @param {object} src source object
	 *  @param {string} name property
	 *  @param {string} [mappedName] name to map too - optional, name used if not given
	 *  @memberof DataTable#oApi
	 */
	function _fnMap( ret, src, name, mappedName )
	{
		if ( Array.isArray( name ) ) {
			$.each( name, function (i, val) {
				if ( Array.isArray( val ) ) {
					_fnMap( ret, src, val[0], val[1] );
				}
				else {
					_fnMap( ret, src, val );
				}
			} );
	
			return;
		}
	
		if ( mappedName === undefined ) {
			mappedName = name;
		}
	
		if ( src[name] !== undefined ) {
			ret[mappedName] = src[name];
		}
	}
	
	
	/**
	 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
	 * shallow copy arrays. The reason we need to do this, is that we don't want to
	 * deep copy array init values (such as aaSorting) since the dev wouldn't be
	 * able to override them, but we do want to deep copy arrays.
	 *  @param {object} out Object to extend
	 *  @param {object} extender Object from which the properties will be applied to
	 *      out
	 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
	 *      independent copy with the exception of the `data` or `aaData` parameters
	 *      if they are present. This is so you can pass in a collection to
	 *      DataTables and have that used as your data source without breaking the
	 *      references
	 *  @returns {object} out Reference, just for convenience - out === the return.
	 *  @memberof DataTable#oApi
	 *  @todo This doesn't take account of arrays inside the deep copied objects.
	 */
	function _fnExtend( out, extender, breakRefs )
	{
		var val;
	
		for ( var prop in extender ) {
			if ( extender.hasOwnProperty(prop) ) {
				val = extender[prop];
	
				if ( $.isPlainObject( val ) ) {
					if ( ! $.isPlainObject( out[prop] ) ) {
						out[prop] = {};
					}
					$.extend( true, out[prop], val );
				}
				else if ( breakRefs && prop !== 'data' && prop !== 'aaData' && Array.isArray(val) ) {
					out[prop] = val.slice();
				}
				else {
					out[prop] = val;
				}
			}
		}
	
		return out;
	}
	
	
	/**
	 * Bind an event handers to allow a click or return key to activate the callback.
	 * This is good for accessibility since a return on the keyboard will have the
	 * same effect as a click, if the element has focus.
	 *  @param {element} n Element to bind the action to
	 *  @param {object} oData Data object to pass to the triggered function
	 *  @param {function} fn Callback function for when the event is triggered
	 *  @memberof DataTable#oApi
	 */
	function _fnBindAction( n, oData, fn )
	{
		$(n)
			.on( 'click.DT', oData, function (e) {
					$(n).trigger('blur'); // Remove focus outline for mouse users
					fn(e);
				} )
			.on( 'keypress.DT', oData, function (e){
					if ( e.which === 13 ) {
						e.preventDefault();
						fn(e);
					}
				} )
			.on( 'selectstart.DT', function () {
					/* Take the brutal approach to cancelling text selection */
					return false;
				} );
	}
	
	
	/**
	 * Register a callback function. Easily allows a callback function to be added to
	 * an array store of callback functions that can then all be called together.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sStore Name of the array storage for the callbacks in oSettings
	 *  @param {function} fn Function to be called back
	 *  @param {string} sName Identifying name for the callback (i.e. a label)
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackReg( oSettings, sStore, fn, sName )
	{
		if ( fn )
		{
			oSettings[sStore].push( {
				"fn": fn,
				"sName": sName
			} );
		}
	}
	
	
	/**
	 * Fire callback functions and trigger events. Note that the loop over the
	 * callback array store is done backwards! Further note that you do not want to
	 * fire off triggers in time sensitive applications (for example cell creation)
	 * as its slow.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} callbackArr Name of the array storage for the callbacks in
	 *      oSettings
	 *  @param {string} eventName Name of the jQuery custom event to trigger. If
	 *      null no trigger is fired
	 *  @param {array} args Array of arguments to pass to the callback function /
	 *      trigger
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackFire( settings, callbackArr, eventName, args )
	{
		var ret = [];
	
		if ( callbackArr ) {
			ret = $.map( settings[callbackArr].slice().reverse(), function (val, i) {
				return val.fn.apply( settings.oInstance, args );
			} );
		}
	
		if ( eventName !== null ) {
			var e = $.Event( eventName+'.dt' );
	
			$(settings.nTable).trigger( e, args );
	
			ret.push( e.result );
		}
	
		return ret;
	}
	
	
	function _fnLengthOverflow ( settings )
	{
		var
			start = settings._iDisplayStart,
			end = settings.fnDisplayEnd(),
			len = settings._iDisplayLength;
	
		/* If we have space to show extra rows (backing up from the end point - then do so */
		if ( start >= end )
		{
			start = end - len;
		}
	
		// Keep the start record on the current page
		start -= (start % len);
	
		if ( len === -1 || start < 0 )
		{
			start = 0;
		}
	
		settings._iDisplayStart = start;
	}
	
	
	function _fnRenderer( settings, type )
	{
		var renderer = settings.renderer;
		var host = DataTable.ext.renderer[type];
	
		if ( $.isPlainObject( renderer ) && renderer[type] ) {
			// Specific renderer for this type. If available use it, otherwise use
			// the default.
			return host[renderer[type]] || host._;
		}
		else if ( typeof renderer === 'string' ) {
			// Common renderer - if there is one available for this type use it,
			// otherwise use the default
			return host[renderer] || host._;
		}
	
		// Use the default
		return host._;
	}
	
	
	/**
	 * Detect the data source being used for the table. Used to simplify the code
	 * a little (ajax) and to make it compress a little smaller.
	 *
	 *  @param {object} settings dataTables settings object
	 *  @returns {string} Data source
	 *  @memberof DataTable#oApi
	 */
	function _fnDataSource ( settings )
	{
		if ( settings.oFeatures.bServerSide ) {
			return 'ssp';
		}
		else if ( settings.ajax || settings.sAjaxSource ) {
			return 'ajax';
		}
		return 'dom';
	}
	

	
	
	/**
	 * Computed structure of the DataTables API, defined by the options passed to
	 * `DataTable.Api.register()` when building the API.
	 *
	 * The structure is built in order to speed creation and extension of the Api
	 * objects since the extensions are effectively pre-parsed.
	 *
	 * The array is an array of objects with the following structure, where this
	 * base array represents the Api prototype base:
	 *
	 *     [
	 *       {
	 *         name:      'data'                -- string   - Property name
	 *         val:       function () {},       -- function - Api method (or undefined if just an object
	 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	 *       },
	 *       {
	 *         name:     'row'
	 *         val:       {},
	 *         methodExt: [ ... ],
	 *         propExt:   [
	 *           {
	 *             name:      'data'
	 *             val:       function () {},
	 *             methodExt: [ ... ],
	 *             propExt:   [ ... ]
	 *           },
	 *           ...
	 *         ]
	 *       }
	 *     ]
	 *
	 * @type {Array}
	 * @ignore
	 */
	var __apiStruct = [];
	
	
	/**
	 * `Array.prototype` reference.
	 *
	 * @type object
	 * @ignore
	 */
	var __arrayProto = Array.prototype;
	
	
	/**
	 * Abstraction for `context` parameter of the `Api` constructor to allow it to
	 * take several different forms for ease of use.
	 *
	 * Each of the input parameter types will be converted to a DataTables settings
	 * object where possible.
	 *
	 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
	 *   of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 *   * `DataTables.Api` - API instance
	 * @return {array|null} Matching DataTables settings objects. `null` or
	 *   `undefined` is returned if no matching DataTable is found.
	 * @ignore
	 */
	var _toSettings = function ( mixed )
	{
		var idx, jq;
		var settings = DataTable.settings;
		var tables = $.map( settings, function (el, i) {
			return el.nTable;
		} );
	
		if ( ! mixed ) {
			return [];
		}
		else if ( mixed.nTable && mixed.oApi ) {
			// DataTables settings object
			return [ mixed ];
		}
		else if ( mixed.nodeName && mixed.nodeName.toLowerCase() === 'table' ) {
			// Table node
			idx = $.inArray( mixed, tables );
			return idx !== -1 ? [ settings[idx] ] : null;
		}
		else if ( mixed && typeof mixed.settings === 'function' ) {
			return mixed.settings().toArray();
		}
		else if ( typeof mixed === 'string' ) {
			// jQuery selector
			jq = $(mixed);
		}
		else if ( mixed instanceof $ ) {
			// jQuery object (also DataTables instance)
			jq = mixed;
		}
	
		if ( jq ) {
			return jq.map( function(i) {
				idx = $.inArray( this, tables );
				return idx !== -1 ? settings[idx] : null;
			} ).toArray();
		}
	};
	
	
	/**
	 * DataTables API class - used to control and interface with  one or more
	 * DataTables enhanced tables.
	 *
	 * The API class is heavily based on jQuery, presenting a chainable interface
	 * that you can use to interact with tables. Each instance of the API class has
	 * a "context" - i.e. the tables that it will operate on. This could be a single
	 * table, all tables on a page or a sub-set thereof.
	 *
	 * Additionally the API is designed to allow you to easily work with the data in
	 * the tables, retrieving and manipulating it as required. This is done by
	 * presenting the API class as an array like interface. The contents of the
	 * array depend upon the actions requested by each method (for example
	 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
	 * return an array of objects or arrays depending upon your table's
	 * configuration). The API object has a number of array like methods (`push`,
	 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
	 * `unique` etc) to assist your working with the data held in a table.
	 *
	 * Most methods (those which return an Api instance) are chainable, which means
	 * the return from a method call also has all of the methods available that the
	 * top level object had. For example, these two calls are equivalent:
	 *
	 *     // Not chained
	 *     api.row.add( {...} );
	 *     api.draw();
	 *
	 *     // Chained
	 *     api.row.add( {...} ).draw();
	 *
	 * @class DataTable.Api
	 * @param {array|object|string|jQuery} context DataTable identifier. This is
	 *   used to define which DataTables enhanced tables this API will operate on.
	 *   Can be one of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 * @param {array} [data] Data to initialise the Api instance with.
	 *
	 * @example
	 *   // Direct initialisation during DataTables construction
	 *   var api = $('#example').DataTable();
	 *
	 * @example
	 *   // Initialisation using a DataTables jQuery object
	 *   var api = $('#example').dataTable().api();
	 *
	 * @example
	 *   // Initialisation as a constructor
	 *   var api = new $.fn.DataTable.Api( 'table.dataTable' );
	 */
	_Api = function ( context, data )
	{
		if ( ! (this instanceof _Api) ) {
			return new _Api( context, data );
		}
	
		var settings = [];
		var ctxSettings = function ( o ) {
			var a = _toSettings( o );
			if ( a ) {
				settings.push.apply( settings, a );
			}
		};
	
		if ( Array.isArray( context ) ) {
			for ( var i=0, ien=context.length ; i<ien ; i++ ) {
				ctxSettings( context[i] );
			}
		}
		else {
			ctxSettings( context );
		}
	
		// Remove duplicates
		this.context = _unique( settings );
	
		// Initial data
		if ( data ) {
			$.merge( this, data );
		}
	
		// selector
		this.selector = {
			rows: null,
			cols: null,
			opts: null
		};
	
		_Api.extend( this, this, __apiStruct );
	};
	
	DataTable.Api = _Api;
	
	// Don't destroy the existing prototype, just extend it. Required for jQuery 2's
	// isPlainObject.
	$.extend( _Api.prototype, {
		any: function ()
		{
			return this.count() !== 0;
		},
	
	
		concat:  __arrayProto.concat,
	
	
		context: [], // array of table settings objects
	
	
		count: function ()
		{
			return this.flatten().length;
		},
	
	
		each: function ( fn )
		{
			for ( var i=0, ien=this.length ; i<ien; i++ ) {
				fn.call( this, this[i], i, this );
			}
	
			return this;
		},
	
	
		eq: function ( idx )
		{
			var ctx = this.context;
	
			return ctx.length > idx ?
				new _Api( ctx[idx], this[idx] ) :
				null;
		},
	
	
		filter: function ( fn )
		{
			var a = [];
	
			if ( __arrayProto.filter ) {
				a = __arrayProto.filter.call( this, fn, this );
			}
			else {
				// Compatibility for browsers without EMCA-252-5 (JS 1.6)
				for ( var i=0, ien=this.length ; i<ien ; i++ ) {
					if ( fn.call( this, this[i], i, this ) ) {
						a.push( this[i] );
					}
				}
			}
	
			return new _Api( this.context, a );
		},
	
	
		flatten: function ()
		{
			var a = [];
			return new _Api( this.context, a.concat.apply( a, this.toArray() ) );
		},
	
	
		join:    __arrayProto.join,
	
	
		indexOf: __arrayProto.indexOf || function (obj, start)
		{
			for ( var i=(start || 0), ien=this.length ; i<ien ; i++ ) {
				if ( this[i] === obj ) {
					return i;
				}
			}
			return -1;
		},
	
		iterator: function ( flatten, type, fn, alwaysNew ) {
			var
				a = [], ret,
				i, ien, j, jen,
				context = this.context,
				rows, items, item,
				selector = this.selector;
	
			// Argument shifting
			if ( typeof flatten === 'string' ) {
				alwaysNew = fn;
				fn = type;
				type = flatten;
				flatten = false;
			}
	
			for ( i=0, ien=context.length ; i<ien ; i++ ) {
				var apiInst = new _Api( context[i] );
	
				if ( type === 'table' ) {
					ret = fn.call( apiInst, context[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'columns' || type === 'rows' ) {
					// this has same length as context - one entry for each table
					ret = fn.call( apiInst, context[i], this[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell' ) {
					// columns and rows share the same structure.
					// 'this' is an array of column indexes for each context
					items = this[i];
	
					if ( type === 'column-rows' ) {
						rows = _selector_row_indexes( context[i], selector.opts );
					}
	
					for ( j=0, jen=items.length ; j<jen ; j++ ) {
						item = items[j];
	
						if ( type === 'cell' ) {
							ret = fn.call( apiInst, context[i], item.row, item.column, i, j );
						}
						else {
							ret = fn.call( apiInst, context[i], item, i, j, rows );
						}
	
						if ( ret !== undefined ) {
							a.push( ret );
						}
					}
				}
			}
	
			if ( a.length || alwaysNew ) {
				var api = new _Api( context, flatten ? a.concat.apply( [], a ) : a );
				var apiSelector = api.selector;
				apiSelector.rows = selector.rows;
				apiSelector.cols = selector.cols;
				apiSelector.opts = selector.opts;
				return api;
			}
			return this;
		},
	
	
		lastIndexOf: __arrayProto.lastIndexOf || function (obj, start)
		{
			// Bit cheeky...
			return this.indexOf.apply( this.toArray.reverse(), arguments );
		},
	
	
		length:  0,
	
	
		map: function ( fn )
		{
			var a = [];
	
			if ( __arrayProto.map ) {
				a = __arrayProto.map.call( this, fn, this );
			}
			else {
				// Compatibility for browsers without EMCA-252-5 (JS 1.6)
				for ( var i=0, ien=this.length ; i<ien ; i++ ) {
					a.push( fn.call( this, this[i], i ) );
				}
			}
	
			return new _Api( this.context, a );
		},
	
	
		pluck: function ( prop )
		{
			return this.map( function ( el ) {
				return el[ prop ];
			} );
		},
	
		pop:     __arrayProto.pop,
	
	
		push:    __arrayProto.push,
	
	
		// Does not return an API instance
		reduce: __arrayProto.reduce || function ( fn, init )
		{
			return _fnReduce( this, fn, init, 0, this.length, 1 );
		},
	
	
		reduceRight: __arrayProto.reduceRight || function ( fn, init )
		{
			return _fnReduce( this, fn, init, this.length-1, -1, -1 );
		},
	
	
		reverse: __arrayProto.reverse,
	
	
		// Object with rows, columns and opts
		selector: null,
	
	
		shift:   __arrayProto.shift,
	
	
		slice: function () {
			return new _Api( this.context, this );
		},
	
	
		sort:    __arrayProto.sort, // ? name - order?
	
	
		splice:  __arrayProto.splice,
	
	
		toArray: function ()
		{
			return __arrayProto.slice.call( this );
		},
	
	
		to$: function ()
		{
			return $( this );
		},
	
	
		toJQuery: function ()
		{
			return $( this );
		},
	
	
		unique: function ()
		{
			return new _Api( this.context, _unique(this) );
		},
	
	
		unshift: __arrayProto.unshift
	} );
	
	
	_Api.extend = function ( scope, obj, ext )
	{
		// Only extend API instances and static properties of the API
		if ( ! ext.length || ! obj || ( ! (obj instanceof _Api) && ! obj.__dt_wrapper ) ) {
			return;
		}
	
		var
			i, ien,
			struct,
			methodScoping = function ( scope, fn, struc ) {
				return function () {
					var ret = fn.apply( scope, arguments );
	
					// Method extension
					_Api.extend( ret, ret, struc.methodExt );
					return ret;
				};
			};
	
		for ( i=0, ien=ext.length ; i<ien ; i++ ) {
			struct = ext[i];
	
			// Value
			obj[ struct.name ] = struct.type === 'function' ?
				methodScoping( scope, struct.val, struct ) :
				struct.type === 'object' ?
					{} :
					struct.val;
	
			obj[ struct.name ].__dt_wrapper = true;
	
			// Property extension
			_Api.extend( scope, obj[ struct.name ], struct.propExt );
		}
	};
	
	
	// @todo - Is there need for an augment function?
	// _Api.augment = function ( inst, name )
	// {
	// 	// Find src object in the structure from the name
	// 	var parts = name.split('.');
	
	// 	_Api.extend( inst, obj );
	// };
	
	
	//     [
	//       {
	//         name:      'data'                -- string   - Property name
	//         val:       function () {},       -- function - Api method (or undefined if just an object
	//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	//       },
	//       {
	//         name:     'row'
	//         val:       {},
	//         methodExt: [ ... ],
	//         propExt:   [
	//           {
	//             name:      'data'
	//             val:       function () {},
	//             methodExt: [ ... ],
	//             propExt:   [ ... ]
	//           },
	//           ...
	//         ]
	//       }
	//     ]
	
	_Api.register = _api_register = function ( name, val )
	{
		if ( Array.isArray( name ) ) {
			for ( var j=0, jen=name.length ; j<jen ; j++ ) {
				_Api.register( name[j], val );
			}
			return;
		}
	
		var
			i, ien,
			heir = name.split('.'),
			struct = __apiStruct,
			key, method;
	
		var find = function ( src, name ) {
			for ( var i=0, ien=src.length ; i<ien ; i++ ) {
				if ( src[i].name === name ) {
					return src[i];
				}
			}
			return null;
		};
	
		for ( i=0, ien=heir.length ; i<ien ; i++ ) {
			method = heir[i].indexOf('()') !== -1;
			key = method ?
				heir[i].replace('()', '') :
				heir[i];
	
			var src = find( struct, key );
			if ( ! src ) {
				src = {
					name:      key,
					val:       {},
					methodExt: [],
					propExt:   [],
					type:      'object'
				};
				struct.push( src );
			}
	
			if ( i === ien-1 ) {
				src.val = val;
				src.type = typeof val === 'function' ?
					'function' :
					$.isPlainObject( val ) ?
						'object' :
						'other';
			}
			else {
				struct = method ?
					src.methodExt :
					src.propExt;
			}
		}
	};
	
	_Api.registerPlural = _api_registerPlural = function ( pluralName, singularName, val ) {
		_Api.register( pluralName, val );
	
		_Api.register( singularName, function () {
			var ret = val.apply( this, arguments );
	
			if ( ret === this ) {
				// Returned item is the API instance that was passed in, return it
				return this;
			}
			else if ( ret instanceof _Api ) {
				// New API instance returned, want the value from the first item
				// in the returned array for the singular result.
				return ret.length ?
					Array.isArray( ret[0] ) ?
						new _Api( ret.context, ret[0] ) : // Array results are 'enhanced'
						ret[0] :
					undefined;
			}
	
			// Non-API return - just fire it back
			return ret;
		} );
	};
	
	
	/**
	 * Selector for HTML tables. Apply the given selector to the give array of
	 * DataTables settings objects.
	 *
	 * @param {string|integer} [selector] jQuery selector string or integer
	 * @param  {array} Array of DataTables settings objects to be filtered
	 * @return {array}
	 * @ignore
	 */
	var __table_selector = function ( selector, a )
	{
		if ( Array.isArray(selector) ) {
			return $.map( selector, function (item) {
				return __table_selector(item, a);
			} );
		}
	
		// Integer is used to pick out a table by index
		if ( typeof selector === 'number' ) {
			return [ a[ selector ] ];
		}
	
		// Perform a jQuery selector on the table nodes
		var nodes = $.map( a, function (el, i) {
			return el.nTable;
		} );
	
		return $(nodes)
			.filter( selector )
			.map( function (i) {
				// Need to translate back from the table node to the settings
				var idx = $.inArray( this, nodes );
				return a[ idx ];
			} )
			.toArray();
	};
	
	
	
	/**
	 * Context selector for the API's context (i.e. the tables the API instance
	 * refers to.
	 *
	 * @name    DataTable.Api#tables
	 * @param {string|integer} [selector] Selector to pick which tables the iterator
	 *   should operate on. If not given, all tables in the current context are
	 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
	 *   select multiple tables or as an integer to select a single table.
	 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
	 */
	_api_register( 'tables()', function ( selector ) {
		// A new instance is created if there was a selector specified
		return selector !== undefined && selector !== null ?
			new _Api( __table_selector( selector, this.context ) ) :
			this;
	} );
	
	
	_api_register( 'table()', function ( selector ) {
		var tables = this.tables( selector );
		var ctx = tables.context;
	
		// Truncate to the first matched table
		return ctx.length ?
			new _Api( ctx[0] ) :
			tables;
	} );
	
	
	_api_registerPlural( 'tables().nodes()', 'table().node()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTable;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'tables().body()', 'table().body()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTBody;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'tables().header()', 'table().header()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTHead;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'tables().footer()', 'table().footer()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTFoot;
		}, 1 );
	} );
	
	
	_api_registerPlural( 'tables().containers()', 'table().container()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTableWrapper;
		}, 1 );
	} );
	
	
	
	/**
	 * Redraw the tables in the current context.
	 */
	_api_register( 'draw()', function ( paging ) {
		return this.iterator( 'table', function ( settings ) {
			if ( paging === 'page' ) {
				_fnDraw( settings );
			}
			else {
				if ( typeof paging === 'string' ) {
					paging = paging === 'full-hold' ?
						false :
						true;
				}
	
				_fnReDraw( settings, paging===false );
			}
		} );
	} );
	
	
	
	/**
	 * Get the current page index.
	 *
	 * @return {integer} Current page index (zero based)
	 *//**
	 * Set the current page.
	 *
	 * Note that if you attempt to show a page which does not exist, DataTables will
	 * not throw an error, but rather reset the paging.
	 *
	 * @param {integer|string} action The paging action to take. This can be one of:
	 *  * `integer` - The page index to jump to
	 *  * `string` - An action to take:
	 *    * `first` - Jump to first page.
	 *    * `next` - Jump to the next page
	 *    * `previous` - Jump to previous page
	 *    * `last` - Jump to the last page.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page()', function ( action ) {
		if ( action === undefined ) {
			return this.page.info().page; // not an expensive call
		}
	
		// else, have an action to take on all tables
		return this.iterator( 'table', function ( settings ) {
			_fnPageChange( settings, action );
		} );
	} );
	
	
	/**
	 * Paging information for the first table in the current context.
	 *
	 * If you require paging information for another table, use the `table()` method
	 * with a suitable selector.
	 *
	 * @return {object} Object with the following properties set:
	 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
	 *  * `pages` - Total number of pages
	 *  * `start` - Display index for the first record shown on the current page
	 *  * `end` - Display index for the last record shown on the current page
	 *  * `length` - Display length (number of records). Note that generally `start
	 *    + length = end`, but this is not always true, for example if there are
	 *    only 2 records to show on the final page, with a length of 10.
	 *  * `recordsTotal` - Full data set length
	 *  * `recordsDisplay` - Data set length once the current filtering criterion
	 *    are applied.
	 */
	_api_register( 'page.info()', function ( action ) {
		if ( this.context.length === 0 ) {
			return undefined;
		}
	
		var
			settings   = this.context[0],
			start      = settings._iDisplayStart,
			len        = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1;
	
		return {
			"page":           all ? 0 : Math.floor( start / len ),
			"pages":          all ? 1 : Math.ceil( visRecords / len ),
			"start":          start,
			"end":            settings.fnDisplayEnd(),
			"length":         len,
			"recordsTotal":   settings.fnRecordsTotal(),
			"recordsDisplay": visRecords,
			"serverSide":     _fnDataSource( settings ) === 'ssp'
		};
	} );
	
	
	/**
	 * Get the current page length.
	 *
	 * @return {integer} Current page length. Note `-1` indicates that all records
	 *   are to be shown.
	 *//**
	 * Set the current page length.
	 *
	 * @param {integer} Page length to set. Use `-1` to show all records.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page.len()', function ( len ) {
		// Note that we can't call this function 'length()' because `length`
		// is a Javascript property of functions which defines how many arguments
		// the function expects.
		if ( len === undefined ) {
			return this.context.length !== 0 ?
				this.context[0]._iDisplayLength :
				undefined;
		}
	
		// else, set the page length
		return this.iterator( 'table', function ( settings ) {
			_fnLengthChange( settings, len );
		} );
	} );
	
	
	
	var __reload = function ( settings, holdPosition, callback ) {
		// Use the draw event to trigger a callback
		if ( callback ) {
			var api = new _Api( settings );
	
			api.one( 'draw', function () {
				callback( api.ajax.json() );
			} );
		}
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			_fnReDraw( settings, holdPosition );
		}
		else {
			_fnProcessingDisplay( settings, true );
	
			// Cancel an existing request
			var xhr = settings.jqXHR;
			if ( xhr && xhr.readyState !== 4 ) {
				xhr.abort();
			}
	
			// Trigger xhr
			_fnBuildAjax( settings, [], function( json ) {
				_fnClearTable( settings );
	
				var data = _fnAjaxDataSrc( settings, json );
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					_fnAddData( settings, data[i] );
				}
	
				_fnReDraw( settings, holdPosition );
				_fnProcessingDisplay( settings, false );
			} );
		}
	};
	
	
	/**
	 * Get the JSON response from the last Ajax request that DataTables made to the
	 * server. Note that this returns the JSON from the first table in the current
	 * context.
	 *
	 * @return {object} JSON received from the server.
	 */
	_api_register( 'ajax.json()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].json;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Get the data submitted in the last Ajax request
	 */
	_api_register( 'ajax.params()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].oAjaxData;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Reload tables from the Ajax data source. Note that this function will
	 * automatically re-draw the table when the remote data has been loaded.
	 *
	 * @param {boolean} [reset=true] Reset (default) or hold the current paging
	 *   position. A full re-sort and re-filter is performed when this method is
	 *   called, which is why the pagination reset is the default action.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.reload()', function ( callback, resetPaging ) {
		return this.iterator( 'table', function (settings) {
			__reload( settings, resetPaging===false, callback );
		} );
	} );
	
	
	/**
	 * Get the current Ajax URL. Note that this returns the URL from the first
	 * table in the current context.
	 *
	 * @return {string} Current Ajax source URL
	 *//**
	 * Set the Ajax URL. Note that this will set the URL for all tables in the
	 * current context.
	 *
	 * @param {string} url URL to set.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url()', function ( url ) {
		var ctx = this.context;
	
		if ( url === undefined ) {
			// get
			if ( ctx.length === 0 ) {
				return undefined;
			}
			ctx = ctx[0];
	
			return ctx.ajax ?
				$.isPlainObject( ctx.ajax ) ?
					ctx.ajax.url :
					ctx.ajax :
				ctx.sAjaxSource;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( $.isPlainObject( settings.ajax ) ) {
				settings.ajax.url = url;
			}
			else {
				settings.ajax = url;
			}
			// No need to consider sAjaxSource here since DataTables gives priority
			// to `ajax` over `sAjaxSource`. So setting `ajax` here, renders any
			// value of `sAjaxSource` redundant.
		} );
	} );
	
	
	/**
	 * Load data from the newly set Ajax URL. Note that this method is only
	 * available when `ajax.url()` is used to set a URL. Additionally, this method
	 * has the same effect as calling `ajax.reload()` but is provided for
	 * convenience when setting a new URL. Like `ajax.reload()` it will
	 * automatically redraw the table once the remote data has been loaded.
	 *
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url().load()', function ( callback, resetPaging ) {
		// Same as a reload, but makes sense to present it for easy access after a
		// url change
		return this.iterator( 'table', function ( ctx ) {
			__reload( ctx, resetPaging===false, callback );
		} );
	} );
	
	
	
	
	var _selector_run = function ( type, selector, selectFn, settings, opts )
	{
		var
			out = [], res,
			a, i, ien, j, jen,
			selectorType = typeof selector;
	
		// Can't just check for isArray here, as an API or jQuery instance might be
		// given with their array like look
		if ( ! selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined ) {
			selector = [ selector ];
		}
	
		for ( i=0, ien=selector.length ; i<ien ; i++ ) {
			// Only split on simple strings - complex expressions will be jQuery selectors
			a = selector[i] && selector[i].split && ! selector[i].match(/[\[\(:]/) ?
				selector[i].split(',') :
				[ selector[i] ];
	
			for ( j=0, jen=a.length ; j<jen ; j++ ) {
				res = selectFn( typeof a[j] === 'string' ? (a[j]).trim() : a[j] );
	
				if ( res && res.length ) {
					out = out.concat( res );
				}
			}
		}
	
		// selector extensions
		var ext = _ext.selector[ type ];
		if ( ext.length ) {
			for ( i=0, ien=ext.length ; i<ien ; i++ ) {
				out = ext[i]( settings, opts, out );
			}
		}
	
		return _unique( out );
	};
	
	
	var _selector_opts = function ( opts )
	{
		if ( ! opts ) {
			opts = {};
		}
	
		// Backwards compatibility for 1.9- which used the terminology filter rather
		// than search
		if ( opts.filter && opts.search === undefined ) {
			opts.search = opts.filter;
		}
	
		return $.extend( {
			search: 'none',
			order: 'current',
			page: 'all'
		}, opts );
	};
	
	
	var _selector_first = function ( inst )
	{
		// Reduce the API instance to the first item found
		for ( var i=0, ien=inst.length ; i<ien ; i++ ) {
			if ( inst[i].length > 0 ) {
				// Assign the first element to the first item in the instance
				// and truncate the instance and context
				inst[0] = inst[i];
				inst[0].length = 1;
				inst.length = 1;
				inst.context = [ inst.context[i] ];
	
				return inst;
			}
		}
	
		// Not found - return an empty instance
		inst.length = 0;
		return inst;
	};
	
	
	var _selector_row_indexes = function ( settings, opts )
	{
		var
			i, ien, tmp, a=[],
			displayFiltered = settings.aiDisplay,
			displayMaster = settings.aiDisplayMaster;
	
		var
			search = opts.search,  // none, applied, removed
			order  = opts.order,   // applied, current, index (original - compatibility with 1.9)
			page   = opts.page;    // all, current
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			// In server-side processing mode, most options are irrelevant since
			// rows not shown don't exist and the index order is the applied order
			// Removed is a special case - for consistency just return an empty
			// array
			return search === 'removed' ?
				[] :
				_range( 0, displayMaster.length );
		}
		else if ( page == 'current' ) {
			// Current page implies that order=current and fitler=applied, since it is
			// fairly senseless otherwise, regardless of what order and search actually
			// are
			for ( i=settings._iDisplayStart, ien=settings.fnDisplayEnd() ; i<ien ; i++ ) {
				a.push( displayFiltered[i] );
			}
		}
		else if ( order == 'current' || order == 'applied' ) {
			if ( search == 'none') {
				a = displayMaster.slice();
			}
			else if ( search == 'applied' ) {
				a = displayFiltered.slice();
			}
			else if ( search == 'removed' ) {
				// O(n+m) solution by creating a hash map
				var displayFilteredMap = {};
	
				for ( var i=0, ien=displayFiltered.length ; i<ien ; i++ ) {
					displayFilteredMap[displayFiltered[i]] = null;
				}
	
				a = $.map( displayMaster, function (el) {
					return ! displayFilteredMap.hasOwnProperty(el) ?
						el :
						null;
				} );
			}
		}
		else if ( order == 'index' || order == 'original' ) {
			for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				if ( search == 'none' ) {
					a.push( i );
				}
				else { // applied | removed
					tmp = $.inArray( i, displayFiltered );
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( i );
					}
				}
			}
		}
	
		return a;
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rows
	 *
	 * {}          - no selector - use all available rows
	 * {integer}   - row aoData index
	 * {node}      - TR node
	 * {string}    - jQuery selector to apply to the TR elements
	 * {array}     - jQuery array of nodes, or simply an array of TR nodes
	 *
	 */
	var __row_selector = function ( settings, selector, opts )
	{
		var rows;
		var run = function ( sel ) {
			var selInt = _intVal( sel );
			var i, ien;
			var aoData = settings.aoData;
	
			// Short cut - selector is a number and no options provided (default is
			// all records, so no need to check if the index is in there, since it
			// must be - dev error if the index doesn't exist).
			if ( selInt !== null && ! opts ) {
				return [ selInt ];
			}
	
			if ( ! rows ) {
				rows = _selector_row_indexes( settings, opts );
			}
	
			if ( selInt !== null && $.inArray( selInt, rows ) !== -1 ) {
				// Selector - integer
				return [ selInt ];
			}
			else if ( sel === null || sel === undefined || sel === '' ) {
				// Selector - none
				return rows;
			}
	
			// Selector - function
			if ( typeof sel === 'function' ) {
				return $.map( rows, function (idx) {
					var row = aoData[ idx ];
					return sel( idx, row._aData, row.nTr ) ? idx : null;
				} );
			}
	
			// Selector - node
			if ( sel.nodeName ) {
				var rowIdx = sel._DT_RowIndex;  // Property added by DT for fast lookup
				var cellIdx = sel._DT_CellIndex;
	
				if ( rowIdx !== undefined ) {
					// Make sure that the row is actually still present in the table
					return aoData[ rowIdx ] && aoData[ rowIdx ].nTr === sel ?
						[ rowIdx ] :
						[];
				}
				else if ( cellIdx ) {
					return aoData[ cellIdx.row ] && aoData[ cellIdx.row ].nTr === sel.parentNode ?
						[ cellIdx.row ] :
						[];
				}
				else {
					var host = $(sel).closest('*[data-dt-row]');
					return host.length ?
						[ host.data('dt-row') ] :
						[];
				}
			}
	
			// ID selector. Want to always be able to select rows by id, regardless
			// of if the tr element has been created or not, so can't rely upon
			// jQuery here - hence a custom implementation. This does not match
			// Sizzle's fast selector or HTML4 - in HTML5 the ID can be anything,
			// but to select it using a CSS selector engine (like Sizzle or
			// querySelect) it would need to need to be escaped for some characters.
			// DataTables simplifies this for row selectors since you can select
			// only a row. A # indicates an id any anything that follows is the id -
			// unescaped.
			if ( typeof sel === 'string' && sel.charAt(0) === '#' ) {
				// get row index from id
				var rowObj = settings.aIds[ sel.replace( /^#/, '' ) ];
				if ( rowObj !== undefined ) {
					return [ rowObj.idx ];
				}
	
				// need to fall through to jQuery in case there is DOM id that
				// matches
			}
			
			// Get nodes in the order from the `rows` array with null values removed
			var nodes = _removeEmpty(
				_pluck_order( settings.aoData, rows, 'nTr' )
			);
	
			// Selector - jQuery selector string, array of nodes or jQuery object/
			// As jQuery's .filter() allows jQuery objects to be passed in filter,
			// it also allows arrays, so this will cope with all three options
			return $(nodes)
				.filter( sel )
				.map( function () {
					return this._DT_RowIndex;
				} )
				.toArray();
		};
	
		return _selector_run( 'row', selector, run, settings, opts );
	};
	
	
	_api_register( 'rows()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __row_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in __row_selector?
		inst.selector.rows = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_register( 'rows().nodes()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return settings.aoData[ row ].nTr || undefined;
		}, 1 );
	} );
	
	_api_register( 'rows().data()', function () {
		return this.iterator( true, 'rows', function ( settings, rows ) {
			return _pluck_order( settings.aoData, rows, '_aData' );
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().cache()', 'row().cache()', function ( type ) {
		return this.iterator( 'row', function ( settings, row ) {
			var r = settings.aoData[ row ];
			return type === 'search' ? r._aFilterData : r._aSortData;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().invalidate()', 'row().invalidate()', function ( src ) {
		return this.iterator( 'row', function ( settings, row ) {
			_fnInvalidate( settings, row, src );
		} );
	} );
	
	_api_registerPlural( 'rows().indexes()', 'row().index()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return row;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().ids()', 'row().id()', function ( hash ) {
		var a = [];
		var context = this.context;
	
		// `iterator` will drop undefined values, but in this case we want them
		for ( var i=0, ien=context.length ; i<ien ; i++ ) {
			for ( var j=0, jen=this[i].length ; j<jen ; j++ ) {
				var id = context[i].rowIdFn( context[i].aoData[ this[i][j] ]._aData );
				a.push( (hash === true ? '#' : '' )+ id );
			}
		}
	
		return new _Api( context, a );
	} );
	
	_api_registerPlural( 'rows().remove()', 'row().remove()', function () {
		var that = this;
	
		this.iterator( 'row', function ( settings, row, thatIdx ) {
			var data = settings.aoData;
			var rowData = data[ row ];
			var i, ien, j, jen;
			var loopRow, loopCells;
	
			data.splice( row, 1 );
	
			// Update the cached indexes
			for ( i=0, ien=data.length ; i<ien ; i++ ) {
				loopRow = data[i];
				loopCells = loopRow.anCells;
	
				// Rows
				if ( loopRow.nTr !== null ) {
					loopRow.nTr._DT_RowIndex = i;
				}
	
				// Cells
				if ( loopCells !== null ) {
					for ( j=0, jen=loopCells.length ; j<jen ; j++ ) {
						loopCells[j]._DT_CellIndex.row = i;
					}
				}
			}
	
			// Delete from the display arrays
			_fnDeleteIndex( settings.aiDisplayMaster, row );
			_fnDeleteIndex( settings.aiDisplay, row );
			_fnDeleteIndex( that[ thatIdx ], row, false ); // maintain local indexes
	
			// For server-side processing tables - subtract the deleted row from the count
			if ( settings._iRecordsDisplay > 0 ) {
				settings._iRecordsDisplay--;
			}
	
			// Check for an 'overflow' they case for displaying the table
			_fnLengthOverflow( settings );
	
			// Remove the row's ID reference if there is one
			var id = settings.rowIdFn( rowData._aData );
			if ( id !== undefined ) {
				delete settings.aIds[ id ];
			}
		} );
	
		this.iterator( 'table', function ( settings ) {
			for ( var i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				settings.aoData[i].idx = i;
			}
		} );
	
		return this;
	} );
	
	
	_api_register( 'rows.add()', function ( rows ) {
		var newRows = this.iterator( 'table', function ( settings ) {
				var row, i, ien;
				var out = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
						out.push( _fnAddTr( settings, row )[0] );
					}
					else {
						out.push( _fnAddData( settings, row ) );
					}
				}
	
				return out;
			}, 1 );
	
		// Return an Api.rows() extended instance, so rows().nodes() etc can be used
		var modRows = this.rows( -1 );
		modRows.pop();
		$.merge( modRows, newRows );
	
		return modRows;
	} );
	
	
	
	
	
	/**
	 *
	 */
	_api_register( 'row()', function ( selector, opts ) {
		return _selector_first( this.rows( selector, opts ) );
	} );
	
	
	_api_register( 'row().data()', function ( data ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// Get
			return ctx.length && this.length ?
				ctx[0].aoData[ this[0] ]._aData :
				undefined;
		}
	
		// Set
		var row = ctx[0].aoData[ this[0] ];
		row._aData = data;
	
		// If the DOM has an id, and the data source is an array
		if ( Array.isArray( data ) && row.nTr && row.nTr.id ) {
			_fnSetObjectDataFn( ctx[0].rowId )( data, row.nTr.id );
		}
	
		// Automatically invalidate
		_fnInvalidate( ctx[0], this[0], 'data' );
	
		return this;
	} );
	
	
	_api_register( 'row().node()', function () {
		var ctx = this.context;
	
		return ctx.length && this.length ?
			ctx[0].aoData[ this[0] ].nTr || null :
			null;
	} );
	
	
	_api_register( 'row.add()', function ( row ) {
		// Allow a jQuery object to be passed in - only a single row is added from
		// it though - the first element in the set
		if ( row instanceof $ && row.length ) {
			row = row[0];
		}
	
		var rows = this.iterator( 'table', function ( settings ) {
			if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
				return _fnAddTr( settings, row )[0];
			}
			return _fnAddData( settings, row );
		} );
	
		// Return an Api.rows() extended instance, with the newly added row selected
		return this.row( rows[0] );
	} );
	
	
	
	var __details_add = function ( ctx, row, data, klass )
	{
		// Convert to array of TR elements
		var rows = [];
		var addRow = function ( r, k ) {
			// Recursion to allow for arrays of jQuery objects
			if ( Array.isArray( r ) || r instanceof $ ) {
				for ( var i=0, ien=r.length ; i<ien ; i++ ) {
					addRow( r[i], k );
				}
				return;
			}
	
			// If we get a TR element, then just add it directly - up to the dev
			// to add the correct number of columns etc
			if ( r.nodeName && r.nodeName.toLowerCase() === 'tr' ) {
				rows.push( r );
			}
			else {
				// Otherwise create a row with a wrapper
				var created = $('<tr><td></td></tr>').addClass( k );
				$('td', created)
					.addClass( k )
					.html( r )
					[0].colSpan = _fnVisbleColumns( ctx );
	
				rows.push( created[0] );
			}
		};
	
		addRow( data, klass );
	
		if ( row._details ) {
			row._details.detach();
		}
	
		row._details = $(rows);
	
		// If the children were already shown, that state should be retained
		if ( row._detailsShow ) {
			row._details.insertAfter( row.nTr );
		}
	};
	
	
	var __details_remove = function ( api, idx )
	{
		var ctx = api.context;
	
		if ( ctx.length ) {
			var row = ctx[0].aoData[ idx !== undefined ? idx : api[0] ];
	
			if ( row && row._details ) {
				row._details.remove();
	
				row._detailsShow = undefined;
				row._details = undefined;
			}
		}
	};
	
	
	var __details_display = function ( api, show ) {
		var ctx = api.context;
	
		if ( ctx.length && api.length ) {
			var row = ctx[0].aoData[ api[0] ];
	
			if ( row._details ) {
				row._detailsShow = show;
	
				if ( show ) {
					row._details.insertAfter( row.nTr );
				}
				else {
					row._details.detach();
				}
	
				__details_events( ctx[0] );
			}
		}
	};
	
	
	var __details_events = function ( settings )
	{
		var api = new _Api( settings );
		var namespace = '.dt.DT_details';
		var drawEvent = 'draw'+namespace;
		var colvisEvent = 'column-visibility'+namespace;
		var destroyEvent = 'destroy'+namespace;
		var data = settings.aoData;
	
		api.off( drawEvent +' '+ colvisEvent +' '+ destroyEvent );
	
		if ( _pluck( data, '_details' ).length > 0 ) {
			// On each draw, insert the required elements into the document
			api.on( drawEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				api.rows( {page:'current'} ).eq(0).each( function (idx) {
					// Internal data grab
					var row = data[ idx ];
	
					if ( row._detailsShow ) {
						row._details.insertAfter( row.nTr );
					}
				} );
			} );
	
			// Column visibility change - update the colspan
			api.on( colvisEvent, function ( e, ctx, idx, vis ) {
				if ( settings !== ctx ) {
					return;
				}
	
				// Update the colspan for the details rows (note, only if it already has
				// a colspan)
				var row, visible = _fnVisbleColumns( ctx );
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					row = data[i];
	
					if ( row._details ) {
						row._details.children('td[colspan]').attr('colspan', visible );
					}
				}
			} );
	
			// Table destroyed - nuke any child rows
			api.on( destroyEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					if ( data[i]._details ) {
						__details_remove( api, i );
					}
				}
			} );
		}
	};
	
	// Strings for the method names to help minification
	var _emp = '';
	var _child_obj = _emp+'row().child';
	var _child_mth = _child_obj+'()';
	
	// data can be:
	//  tr
	//  string
	//  jQuery or array of any of the above
	_api_register( _child_mth, function ( data, klass ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// get
			return ctx.length && this.length ?
				ctx[0].aoData[ this[0] ]._details :
				undefined;
		}
		else if ( data === true ) {
			// show
			this.child.show();
		}
		else if ( data === false ) {
			// remove
			__details_remove( this );
		}
		else if ( ctx.length && this.length ) {
			// set
			__details_add( ctx[0], ctx[0].aoData[ this[0] ], data, klass );
		}
	
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.show()',
		_child_mth+'.show()' // only when `child()` was called with parameters (without
	], function ( show ) {   // it returns an object and this method is not executed)
		__details_display( this, true );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.hide()',
		_child_mth+'.hide()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, false );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.remove()',
		_child_mth+'.remove()' // only when `child()` was called with parameters (without
	], function () {           // it returns an object and this method is not executed)
		__details_remove( this );
		return this;
	} );
	
	
	_api_register( _child_obj+'.isShown()', function () {
		var ctx = this.context;
	
		if ( ctx.length && this.length ) {
			// _detailsShown as false or undefined will fall through to return false
			return ctx[0].aoData[ this[0] ]._detailsShow || false;
		}
		return false;
	} );
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Columns
	 *
	 * {integer}           - column index (>=0 count from left, <0 count from right)
	 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
	 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
	 * "{string}:name"     - column name
	 * "{string}"          - jQuery selector on column header nodes
	 *
	 */
	
	// can be an array of these items, comma separated list, or an array of comma
	// separated lists
	
	var __re_column_selector = /^([^:]+):(name|visIdx|visible)$/;
	
	
	// r1 and r2 are redundant - but it means that the parameters match for the
	// iterator callback in columns().data()
	var __columnData = function ( settings, column, r1, r2, rows ) {
		var a = [];
		for ( var row=0, ien=rows.length ; row<ien ; row++ ) {
			a.push( _fnGetCellData( settings, rows[row], column ) );
		}
		return a;
	};
	
	
	var __column_selector = function ( settings, selector, opts )
	{
		var
			columns = settings.aoColumns,
			names = _pluck( columns, 'sName' ),
			nodes = _pluck( columns, 'nTh' );
	
		var run = function ( s ) {
			var selInt = _intVal( s );
	
			// Selector - all
			if ( s === '' ) {
				return _range( columns.length );
			}
	
			// Selector - index
			if ( selInt !== null ) {
				return [ selInt >= 0 ?
					selInt : // Count from left
					columns.length + selInt // Count from right (+ because its a negative value)
				];
			}
	
			// Selector = function
			if ( typeof s === 'function' ) {
				var rows = _selector_row_indexes( settings, opts );
	
				return $.map( columns, function (col, idx) {
					return s(
							idx,
							__columnData( settings, idx, 0, 0, rows ),
							nodes[ idx ]
						) ? idx : null;
				} );
			}
	
			// jQuery or string selector
			var match = typeof s === 'string' ?
				s.match( __re_column_selector ) :
				'';
	
			if ( match ) {
				switch( match[2] ) {
					case 'visIdx':
					case 'visible':
						var idx = parseInt( match[1], 10 );
						// Visible index given, convert to column index
						if ( idx < 0 ) {
							// Counting from the right
							var visColumns = $.map( columns, function (col,i) {
								return col.bVisible ? i : null;
							} );
							return [ visColumns[ visColumns.length + idx ] ];
						}
						// Counting from the left
						return [ _fnVisibleToColumnIndex( settings, idx ) ];
	
					case 'name':
						// match by name. `names` is column index complete and in order
						return $.map( names, function (name, i) {
							return name === match[1] ? i : null;
						} );
	
					default:
						return [];
				}
			}
	
			// Cell in the table body
			if ( s.nodeName && s._DT_CellIndex ) {
				return [ s._DT_CellIndex.column ];
			}
	
			// jQuery selector on the TH elements for the columns
			var jqResult = $( nodes )
				.filter( s )
				.map( function () {
					return $.inArray( this, nodes ); // `nodes` is column index complete and in order
				} )
				.toArray();
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise a node which might have a `dt-column` data attribute, or be
			// a child or such an element
			var host = $(s).closest('*[data-dt-column]');
			return host.length ?
				[ host.data('dt-column') ] :
				[];
		};
	
		return _selector_run( 'column', selector, run, settings, opts );
	};
	
	
	var __setColumnVis = function ( settings, column, vis ) {
		var
			cols = settings.aoColumns,
			col  = cols[ column ],
			data = settings.aoData,
			row, cells, i, ien, tr;
	
		// Get
		if ( vis === undefined ) {
			return col.bVisible;
		}
	
		// Set
		// No change
		if ( col.bVisible === vis ) {
			return;
		}
	
		if ( vis ) {
			// Insert column
			// Need to decide if we should use appendChild or insertBefore
			var insertBefore = $.inArray( true, _pluck(cols, 'bVisible'), column+1 );
	
			for ( i=0, ien=data.length ; i<ien ; i++ ) {
				tr = data[i].nTr;
				cells = data[i].anCells;
	
				if ( tr ) {
					// insertBefore can act like appendChild if 2nd arg is null
					tr.insertBefore( cells[ column ], cells[ insertBefore ] || null );
				}
			}
		}
		else {
			// Remove column
			$( _pluck( settings.aoData, 'anCells', column ) ).detach();
		}
	
		// Common actions
		col.bVisible = vis;
	};
	
	
	_api_register( 'columns()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __column_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in _row_selector?
		inst.selector.cols = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_registerPlural( 'columns().header()', 'column().header()', function ( selector, opts ) {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].nTh;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().footer()', 'column().footer()', function ( selector, opts ) {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].nTf;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().data()', 'column().data()', function () {
		return this.iterator( 'column-rows', __columnData, 1 );
	} );
	
	_api_registerPlural( 'columns().dataSrc()', 'column().dataSrc()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].mData;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().cache()', 'column().cache()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows,
				type === 'search' ? '_aFilterData' : '_aSortData', column
			);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().nodes()', 'column().nodes()', function () {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows, 'anCells', column ) ;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().visible()', 'column().visible()', function ( vis, calc ) {
		var that = this;
		var ret = this.iterator( 'column', function ( settings, column ) {
			if ( vis === undefined ) {
				return settings.aoColumns[ column ].bVisible;
			} // else
			__setColumnVis( settings, column, vis );
		} );
	
		// Group the column visibility changes
		if ( vis !== undefined ) {
			this.iterator( 'table', function ( settings ) {
				// Redraw the header after changes
				_fnDrawHead( settings, settings.aoHeader );
				_fnDrawHead( settings, settings.aoFooter );
		
				// Update colspan for no records display. Child rows and extensions will use their own
				// listeners to do this - only need to update the empty table item here
				if ( ! settings.aiDisplay.length ) {
					$(settings.nTBody).find('td[colspan]').attr('colspan', _fnVisbleColumns(settings));
				}
		
				_fnSaveState( settings );
	
				// Second loop once the first is done for events
				that.iterator( 'column', function ( settings, column ) {
					_fnCallbackFire( settings, null, 'column-visibility', [settings, column, vis, calc] );
				} );
	
				if ( calc === undefined || calc ) {
					that.columns.adjust();
				}
			});
		}
	
		return ret;
	} );
	
	_api_registerPlural( 'columns().indexes()', 'column().index()', function ( type ) {
		return this.iterator( 'column', function ( settings, column ) {
			return type === 'visible' ?
				_fnColumnIndexToVisible( settings, column ) :
				column;
		}, 1 );
	} );
	
	_api_register( 'columns.adjust()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnAdjustColumnSizing( settings );
		}, 1 );
	} );
	
	_api_register( 'column.index()', function ( type, idx ) {
		if ( this.context.length !== 0 ) {
			var ctx = this.context[0];
	
			if ( type === 'fromVisible' || type === 'toData' ) {
				return _fnVisibleToColumnIndex( ctx, idx );
			}
			else if ( type === 'fromData' || type === 'toVisible' ) {
				return _fnColumnIndexToVisible( ctx, idx );
			}
		}
	} );
	
	_api_register( 'column()', function ( selector, opts ) {
		return _selector_first( this.columns( selector, opts ) );
	} );
	
	var __cell_selector = function ( settings, selector, opts )
	{
		var data = settings.aoData;
		var rows = _selector_row_indexes( settings, opts );
		var cells = _removeEmpty( _pluck_order( data, rows, 'anCells' ) );
		var allCells = $(_flatten( [], cells ));
		var row;
		var columns = settings.aoColumns.length;
		var a, i, ien, j, o, host;
	
		var run = function ( s ) {
			var fnSelector = typeof s === 'function';
	
			if ( s === null || s === undefined || fnSelector ) {
				// All cells and function selectors
				a = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					for ( j=0 ; j<columns ; j++ ) {
						o = {
							row: row,
							column: j
						};
	
						if ( fnSelector ) {
							// Selector - function
							host = data[ row ];
	
							if ( s( o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null ) ) {
								a.push( o );
							}
						}
						else {
							// Selector - all
							a.push( o );
						}
					}
				}
	
				return a;
			}
			
			// Selector - index
			if ( $.isPlainObject( s ) ) {
				// Valid cell index and its in the array of selectable rows
				return s.column !== undefined && s.row !== undefined && $.inArray( s.row, rows ) !== -1 ?
					[s] :
					[];
			}
	
			// Selector - jQuery filtered cells
			var jqResult = allCells
				.filter( s )
				.map( function (i, el) {
					return { // use a new object, in case someone changes the values
						row:    el._DT_CellIndex.row,
						column: el._DT_CellIndex.column
	 				};
				} )
				.toArray();
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise the selector is a node, and there is one last option - the
			// element might be a child of an element which has dt-row and dt-column
			// data attributes
			host = $(s).closest('*[data-dt-row]');
			return host.length ?
				[ {
					row: host.data('dt-row'),
					column: host.data('dt-column')
				} ] :
				[];
		};
	
		return _selector_run( 'cell', selector, run, settings, opts );
	};
	
	
	
	
	_api_register( 'cells()', function ( rowSelector, columnSelector, opts ) {
		// Argument shifting
		if ( $.isPlainObject( rowSelector ) ) {
			// Indexes
			if ( rowSelector.row === undefined ) {
				// Selector options in first parameter
				opts = rowSelector;
				rowSelector = null;
			}
			else {
				// Cell index objects in first parameter
				opts = columnSelector;
				columnSelector = null;
			}
		}
		if ( $.isPlainObject( columnSelector ) ) {
			opts = columnSelector;
			columnSelector = null;
		}
	
		// Cell selector
		if ( columnSelector === null || columnSelector === undefined ) {
			return this.iterator( 'table', function ( settings ) {
				return __cell_selector( settings, rowSelector, _selector_opts( opts ) );
			} );
		}
	
		// The default built in options need to apply to row and columns
		var internalOpts = opts ? {
			page: opts.page,
			order: opts.order,
			search: opts.search
		} : {};
	
		// Row + column selector
		var columns = this.columns( columnSelector, internalOpts );
		var rows = this.rows( rowSelector, internalOpts );
		var i, ien, j, jen;
	
		var cellsNoOpts = this.iterator( 'table', function ( settings, idx ) {
			var a = [];
	
			for ( i=0, ien=rows[idx].length ; i<ien ; i++ ) {
				for ( j=0, jen=columns[idx].length ; j<jen ; j++ ) {
					a.push( {
						row:    rows[idx][i],
						column: columns[idx][j]
					} );
				}
			}
	
			return a;
		}, 1 );
	
		// There is currently only one extension which uses a cell selector extension
		// It is a _major_ performance drag to run this if it isn't needed, so this is
		// an extension specific check at the moment
		var cells = opts && opts.selected ?
			this.cells( cellsNoOpts, opts ) :
			cellsNoOpts;
	
		$.extend( cells.selector, {
			cols: columnSelector,
			rows: rowSelector,
			opts: opts
		} );
	
		return cells;
	} );
	
	
	_api_registerPlural( 'cells().nodes()', 'cell().node()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			var data = settings.aoData[ row ];
	
			return data && data.anCells ?
				data.anCells[ column ] :
				undefined;
		}, 1 );
	} );
	
	
	_api_register( 'cells().data()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().cache()', 'cell().cache()', function ( type ) {
		type = type === 'search' ? '_aFilterData' : '_aSortData';
	
		return this.iterator( 'cell', function ( settings, row, column ) {
			return settings.aoData[ row ][ type ][ column ];
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().render()', 'cell().render()', function ( type ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column, type );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().indexes()', 'cell().index()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return {
				row: row,
				column: column,
				columnVisible: _fnColumnIndexToVisible( settings, column )
			};
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().invalidate()', 'cell().invalidate()', function ( src ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			_fnInvalidate( settings, row, src, column );
		} );
	} );
	
	
	
	_api_register( 'cell()', function ( rowSelector, columnSelector, opts ) {
		return _selector_first( this.cells( rowSelector, columnSelector, opts ) );
	} );
	
	
	_api_register( 'cell().data()', function ( data ) {
		var ctx = this.context;
		var cell = this[0];
	
		if ( data === undefined ) {
			// Get
			return ctx.length && cell.length ?
				_fnGetCellData( ctx[0], cell[0].row, cell[0].column ) :
				undefined;
		}
	
		// Set
		_fnSetCellData( ctx[0], cell[0].row, cell[0].column, data );
		_fnInvalidate( ctx[0], cell[0].row, 'data', cell[0].column );
	
		return this;
	} );
	
	
	
	/**
	 * Get current ordering (sorting) that has been applied to the table.
	 *
	 * @returns {array} 2D array containing the sorting information for the first
	 *   table in the current context. Each element in the parent array represents
	 *   a column being sorted upon (i.e. multi-sorting with two columns would have
	 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
	 *   the column index that the sorting condition applies to, the second is the
	 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
	 *   index of the sorting order from the `column.sorting` initialisation array.
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {integer} order Column index to sort upon.
	 * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 1D array of sorting information to be applied.
	 * @param {array} [...] Optional additional sorting conditions
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 2D array of sorting information to be applied.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order()', function ( order, dir ) {
		var ctx = this.context;
	
		if ( order === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].aaSorting :
				undefined;
		}
	
		// set
		if ( typeof order === 'number' ) {
			// Simple column / direction passed in
			order = [ [ order, dir ] ];
		}
		else if ( order.length && ! Array.isArray( order[0] ) ) {
			// Arguments passed in (list of 1D arrays)
			order = Array.prototype.slice.call( arguments );
		}
		// otherwise a 2D array was passed in
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSorting = order.slice();
		} );
	} );
	
	
	/**
	 * Attach a sort listener to an element for a given column
	 *
	 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
	 *   listener to. This can take the form of a single DOM node, a jQuery
	 *   collection of nodes or a jQuery selector which will identify the node(s).
	 * @param {integer} column the column that a click on this node will sort on
	 * @param {function} [callback] callback function when sort is run
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order.listener()', function ( node, column, callback ) {
		return this.iterator( 'table', function ( settings ) {
			_fnSortAttachListener( settings, node, column, callback );
		} );
	} );
	
	
	_api_register( 'order.fixed()', function ( set ) {
		if ( ! set ) {
			var ctx = this.context;
			var fixed = ctx.length ?
				ctx[0].aaSortingFixed :
				undefined;
	
			return Array.isArray( fixed ) ?
				{ pre: fixed } :
				fixed;
		}
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSortingFixed = $.extend( true, {}, set );
		} );
	} );
	
	
	// Order by the selected column(s)
	_api_register( [
		'columns().order()',
		'column().order()'
	], function ( dir ) {
		var that = this;
	
		return this.iterator( 'table', function ( settings, i ) {
			var sort = [];
	
			$.each( that[i], function (j, col) {
				sort.push( [ col, dir ] );
			} );
	
			settings.aaSorting = sort;
		} );
	} );
	
	
	
	_api_register( 'search()', function ( input, regex, smart, caseInsen ) {
		var ctx = this.context;
	
		if ( input === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].oPreviousSearch.sSearch :
				undefined;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( ! settings.oFeatures.bFilter ) {
				return;
			}
	
			_fnFilterComplete( settings, $.extend( {}, settings.oPreviousSearch, {
				"sSearch": input+"",
				"bRegex":  regex === null ? false : regex,
				"bSmart":  smart === null ? true  : smart,
				"bCaseInsensitive": caseInsen === null ? true : caseInsen
			} ), 1 );
		} );
	} );
	
	
	_api_registerPlural(
		'columns().search()',
		'column().search()',
		function ( input, regex, smart, caseInsen ) {
			return this.iterator( 'column', function ( settings, column ) {
				var preSearch = settings.aoPreSearchCols;
	
				if ( input === undefined ) {
					// get
					return preSearch[ column ].sSearch;
				}
	
				// set
				if ( ! settings.oFeatures.bFilter ) {
					return;
				}
	
				$.extend( preSearch[ column ], {
					"sSearch": input+"",
					"bRegex":  regex === null ? false : regex,
					"bSmart":  smart === null ? true  : smart,
					"bCaseInsensitive": caseInsen === null ? true : caseInsen
				} );
	
				_fnFilterComplete( settings, settings.oPreviousSearch, 1 );
			} );
		}
	);
	
	/*
	 * State API methods
	 */
	
	_api_register( 'state()', function () {
		return this.context.length ?
			this.context[0].oSavedState :
			null;
	} );
	
	
	_api_register( 'state.clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			// Save an empty object
			settings.fnStateSaveCallback.call( settings.oInstance, settings, {} );
		} );
	} );
	
	
	_api_register( 'state.loaded()', function () {
		return this.context.length ?
			this.context[0].oLoadedState :
			null;
	} );
	
	
	_api_register( 'state.save()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnSaveState( settings );
		} );
	} );
	
	
	
	/**
	 * Provide a common method for plug-ins to check the version of DataTables being
	 * used, in order to ensure compatibility.
	 *
	 *  @param {string} version Version string to check for, in the format "X.Y.Z".
	 *    Note that the formats "X" and "X.Y" are also acceptable.
	 *  @returns {boolean} true if this version of DataTables is greater or equal to
	 *    the required version, or false if this version of DataTales is not
	 *    suitable
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
	 */
	DataTable.versionCheck = DataTable.fnVersionCheck = function( version )
	{
		var aThis = DataTable.version.split('.');
		var aThat = version.split('.');
		var iThis, iThat;
	
		for ( var i=0, iLen=aThat.length ; i<iLen ; i++ ) {
			iThis = parseInt( aThis[i], 10 ) || 0;
			iThat = parseInt( aThat[i], 10 ) || 0;
	
			// Parts are the same, keep comparing
			if (iThis === iThat) {
				continue;
			}
	
			// Parts are different, return immediately
			return iThis > iThat;
		}
	
		return true;
	};
	
	
	/**
	 * Check if a `<table>` node is a DataTable table already or not.
	 *
	 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
	 *      selector for the table to test. Note that if more than more than one
	 *      table is passed on, only the first will be checked
	 *  @returns {boolean} true the table given is a DataTable, or false otherwise
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
	 *      $('#example').dataTable();
	 *    }
	 */
	DataTable.isDataTable = DataTable.fnIsDataTable = function ( table )
	{
		var t = $(table).get(0);
		var is = false;
	
		if ( table instanceof DataTable.Api ) {
			return true;
		}
	
		$.each( DataTable.settings, function (i, o) {
			var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
			var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;
	
			if ( o.nTable === t || head === t || foot === t ) {
				is = true;
			}
		} );
	
		return is;
	};
	
	
	/**
	 * Get all DataTable tables that have been initialised - optionally you can
	 * select to get only currently visible tables.
	 *
	 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
	 *    or visible tables only.
	 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
	 *    DataTables
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    $.each( $.fn.dataTable.tables(true), function () {
	 *      $(table).DataTable().columns.adjust();
	 *    } );
	 */
	DataTable.tables = DataTable.fnTables = function ( visible )
	{
		var api = false;
	
		if ( $.isPlainObject( visible ) ) {
			api = visible.api;
			visible = visible.visible;
		}
	
		var a = $.map( DataTable.settings, function (o) {
			if ( !visible || (visible && $(o.nTable).is(':visible')) ) {
				return o.nTable;
			}
		} );
	
		return api ?
			new _Api( a ) :
			a;
	};
	
	
	/**
	 * Convert from camel case parameters to Hungarian notation. This is made public
	 * for the extensions to provide the same ability as DataTables core to accept
	 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
	 * parameters.
	 *
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 */
	DataTable.camelToHungarian = _fnCamelToHungarian;
	
	
	
	/**
	 *
	 */
	_api_register( '$()', function ( selector, opts ) {
		var
			rows   = this.rows( opts ).nodes(), // Get all rows
			jqRows = $(rows);
	
		return $( [].concat(
			jqRows.filter( selector ).toArray(),
			jqRows.find( selector ).toArray()
		) );
	} );
	
	
	// jQuery functions to operate on the tables
	$.each( [ 'on', 'one', 'off' ], function (i, key) {
		_api_register( key+'()', function ( /* event, handler */ ) {
			var args = Array.prototype.slice.call(arguments);
	
			// Add the `dt` namespace automatically if it isn't already present
			args[0] = $.map( args[0].split( /\s/ ), function ( e ) {
				return ! e.match(/\.dt\b/) ?
					e+'.dt' :
					e;
				} ).join( ' ' );
	
			var inst = $( this.tables().nodes() );
			inst[key].apply( inst, args );
			return this;
		} );
	} );
	
	
	_api_register( 'clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnClearTable( settings );
		} );
	} );
	
	
	_api_register( 'settings()', function () {
		return new _Api( this.context, this.context );
	} );
	
	
	_api_register( 'init()', function () {
		var ctx = this.context;
		return ctx.length ? ctx[0].oInit : null;
	} );
	
	
	_api_register( 'data()', function () {
		return this.iterator( 'table', function ( settings ) {
			return _pluck( settings.aoData, '_aData' );
		} ).flatten();
	} );
	
	
	_api_register( 'destroy()', function ( remove ) {
		remove = remove || false;
	
		return this.iterator( 'table', function ( settings ) {
			var orig      = settings.nTableWrapper.parentNode;
			var classes   = settings.oClasses;
			var table     = settings.nTable;
			var tbody     = settings.nTBody;
			var thead     = settings.nTHead;
			var tfoot     = settings.nTFoot;
			var jqTable   = $(table);
			var jqTbody   = $(tbody);
			var jqWrapper = $(settings.nTableWrapper);
			var rows      = $.map( settings.aoData, function (r) { return r.nTr; } );
			var i, ien;
	
			// Flag to note that the table is currently being destroyed - no action
			// should be taken
			settings.bDestroying = true;
	
			// Fire off the destroy callbacks for plug-ins etc
			_fnCallbackFire( settings, "aoDestroyCallback", "destroy", [settings] );
	
			// If not being removed from the document, make all columns visible
			if ( ! remove ) {
				new _Api( settings ).columns().visible( true );
			}
	
			// Blitz all `DT` namespaced events (these are internal events, the
			// lowercase, `dt` events are user subscribed and they are responsible
			// for removing them
			jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
			$(window).off('.DT-'+settings.sInstance);
	
			// When scrolling we had to break the table up - restore it
			if ( table != thead.parentNode ) {
				jqTable.children('thead').detach();
				jqTable.append( thead );
			}
	
			if ( tfoot && table != tfoot.parentNode ) {
				jqTable.children('tfoot').detach();
				jqTable.append( tfoot );
			}
	
			settings.aaSorting = [];
			settings.aaSortingFixed = [];
			_fnSortingClasses( settings );
	
			$( rows ).removeClass( settings.asStripeClasses.join(' ') );
	
			$('th, td', thead).removeClass( classes.sSortable+' '+
				classes.sSortableAsc+' '+classes.sSortableDesc+' '+classes.sSortableNone
			);
	
			// Add the TR elements back into the table in their original order
			jqTbody.children().detach();
			jqTbody.append( rows );
	
			// Remove the DataTables generated nodes, events and classes
			var removedMethod = remove ? 'remove' : 'detach';
			jqTable[ removedMethod ]();
			jqWrapper[ removedMethod ]();
	
			// If we need to reattach the table to the document
			if ( ! remove && orig ) {
				// insertBefore acts like appendChild if !arg[1]
				orig.insertBefore( table, settings.nTableReinsertBefore );
	
				// Restore the width of the original table - was read from the style property,
				// so we can restore directly to that
				jqTable
					.css( 'width', settings.sDestroyWidth )
					.removeClass( classes.sTable );
	
				// If the were originally stripe classes - then we add them back here.
				// Note this is not fool proof (for example if not all rows had stripe
				// classes - but it's a good effort without getting carried away
				ien = settings.asDestroyStripes.length;
	
				if ( ien ) {
					jqTbody.children().each( function (i) {
						$(this).addClass( settings.asDestroyStripes[i % ien] );
					} );
				}
			}
	
			/* Remove the settings object from the settings array */
			var idx = $.inArray( settings, DataTable.settings );
			if ( idx !== -1 ) {
				DataTable.settings.splice( idx, 1 );
			}
		} );
	} );
	
	
	// Add the `every()` method for rows, columns and cells in a compact form
	$.each( [ 'column', 'row', 'cell' ], function ( i, type ) {
		_api_register( type+'s().every()', function ( fn ) {
			var opts = this.selector.opts;
			var api = this;
	
			return this.iterator( type, function ( settings, arg1, arg2, arg3, arg4 ) {
				// Rows and columns:
				//  arg1 - index
				//  arg2 - table counter
				//  arg3 - loop counter
				//  arg4 - undefined
				// Cells:
				//  arg1 - row index
				//  arg2 - column index
				//  arg3 - table counter
				//  arg4 - loop counter
				fn.call(
					api[ type ](
						arg1,
						type==='cell' ? arg2 : opts,
						type==='cell' ? opts : undefined
					),
					arg1, arg2, arg3, arg4
				);
			} );
		} );
	} );
	
	
	// i18n method for extensions to be able to use the language object from the
	// DataTable
	_api_register( 'i18n()', function ( token, def, plural ) {
		var ctx = this.context[0];
		var resolved = _fnGetObjectDataFn( token )( ctx.oLanguage );
	
		if ( resolved === undefined ) {
			resolved = def;
		}
	
		if ( plural !== undefined && $.isPlainObject( resolved ) ) {
			resolved = resolved[ plural ] !== undefined ?
				resolved[ plural ] :
				resolved._;
		}
	
		return resolved.replace( '%d', plural ); // nb: plural might be undefined,
	} );
	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
	 * only for non-release builds. See http://semver.org/ for more information.
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "1.10.25";

	/**
	 * Private data store, containing all of the settings objects that are
	 * created for the tables on a given page.
	 *
	 * Note that the `DataTable.settings` object is aliased to
	 * `jQuery.fn.dataTableExt` through which it may be accessed and
	 * manipulated, or `jQuery.fn.dataTable.settings`.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];

	/**
	 * Object models container, for the various models that DataTables has
	 * available to it. These models define the objects that are used to hold
	 * the active state and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 *  @type boolean
		 *  @default true
		 */
		"bCaseInsensitive": true,
	
		/**
		 * Applied search term
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sSearch": "",
	
		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 *  @type boolean
		 *  @default false
		 */
		"bRegex": false,
	
		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 *  @type boolean
		 *  @default true
		 */
		"bSmart": true
	};
	
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 *  @type node
		 *  @default null
		 */
		"nTr": null,
	
		/**
		 * Array of TD elements for each row. This is null until the row has been
		 * created.
		 *  @type array nodes
		 *  @default []
		 */
		"anCells": null,
	
		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mData options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data
		 * source.
		 *  @type array|object
		 *  @default []
		 */
		"_aData": [],
	
		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 *  @type array
		 *  @default null
		 *  @private
		 */
		"_aSortData": null,
	
		/**
		 * Per cell filtering data cache. As per the sort data cache, used to
		 * increase the performance of the filtering in DataTables
		 *  @type array
		 *  @default null
		 *  @private
		 */
		"_aFilterData": null,
	
		/**
		 * Filtering data cache. This is the same as the cell filtering cache, but
		 * in this case a string rather than an array. This is easily computed with
		 * a join on `_aFilterData`, but is provided as a cache so the join isn't
		 * needed on every search (memory traded for performance)
		 *  @type array
		 *  @default null
		 *  @private
		 */
		"_sFilterRow": null,
	
		/**
		 * Cache of the class name that DataTables has applied to the row, so we
		 * can quickly look at this variable rather than needing to do a DOM check
		 * on className for the nTr property.
		 *  @type string
		 *  @default <i>Empty string</i>
		 *  @private
		 */
		"_sRowStripe": "",
	
		/**
		 * Denote if the original data source was from the DOM, or the data source
		 * object. This is used for invalidating data, so DataTables can
		 * automatically read data from the original source, unless uninstructed
		 * otherwise.
		 *  @type string
		 *  @default null
		 *  @private
		 */
		"src": null,
	
		/**
		 * Index in the aoData array. This saves an indexOf lookup when we have the
		 * object, but want to know the index
		 *  @type integer
		 *  @default -1
		 *  @private
		 */
		"idx": -1
	};
	
	
	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 *
	 * Note that this object is related to {@link DataTable.defaults.column}
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * Column index. This could be worked out on-the-fly with $.inArray, but it
		 * is faster to just hold it as a variable
		 *  @type integer
		 *  @default null
		 */
		"idx": null,
	
		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 *  @type array
		 */
		"aDataSort": null,
	
		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 *  @type array
		 */
		"asSorting": null,
	
		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 *  @type boolean
		 */
		"bSearchable": null,
	
		/**
		 * Flag to indicate if the column is sortable or not.
		 *  @type boolean
		 */
		"bSortable": null,
	
		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 *  @type boolean
		 */
		"bVisible": null,
	
		/**
		 * Store for manual type assignment using the `column.type` option. This
		 * is held in store so we can manipulate the column's `sType` property.
		 *  @type string
		 *  @default null
		 *  @private
		 */
		"_sManualType": null,
	
		/**
		 * Flag to indicate if HTML5 data attributes should be used as the data
		 * source for filtering or sorting. True is either are.
		 *  @type boolean
		 *  @default false
		 *  @private
		 */
		"_bAttrSrc": false,
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 *  @type function
		 *  @param {element} nTd The TD node that has been created
		 *  @param {*} sData The Data for the cell
		 *  @param {array|object} oData The data for the whole row
		 *  @param {int} iRow The row index for the aoData data store
		 *  @default null
		 */
		"fnCreatedCell": null,
	
		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mData to function as
		 * required. This function is automatically assigned by the column
		 * initialisation method
		 *  @type function
		 *  @param {array|object} oData The data array/object for the array
		 *    (i.e. aoData[]._aData)
		 *  @param {string} sSpecific The specific data type you want to get -
		 *    'display', 'type' 'filter' 'sort'
		 *  @returns {*} The data for the cell from the given row's data
		 *  @default null
		 */
		"fnGetData": null,
	
		/**
		 * Function to set data for a cell in the column. You should <b>never</b>
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mData to function as required. This function
		 * is automatically assigned by the column initialisation method
		 *  @type function
		 *  @param {array|object} oData The data array/object for the array
		 *    (i.e. aoData[]._aData)
		 *  @param {*} sValue Value to set
		 *  @default null
		 */
		"fnSetData": null,
	
		/**
		 * Property to read the value for the cells in the column from the data
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 *  @type function|int|string|null
		 *  @default null
		 */
		"mData": null,
	
		/**
		 * Partner property to mData which is used (only when defined) to get
		 * the data - i.e. it is basically the same as mData, but without the
		 * 'set' option, and also the data fed to it is the result from mData.
		 * This is the rendering method to match the data method of mData.
		 *  @type function|int|string|null
		 *  @default null
		 */
		"mRender": null,
	
		/**
		 * Unique header TH/TD element for this column - this is what the sorting
		 * listener is attached to (if sorting is enabled.)
		 *  @type node
		 *  @default null
		 */
		"nTh": null,
	
		/**
		 * Unique footer TH/TD element for this column (if there is one). Not used
		 * in DataTables as such, but can be used for plug-ins to reference the
		 * footer for each column.
		 *  @type node
		 *  @default null
		 */
		"nTf": null,
	
		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 *  @type string
		 *  @default null
		 */
		"sClass": null,
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 *  @type string
		 */
		"sContentPadding": null,
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 *  @type string
		 *  @default null
		 */
		"sDefaultContent": null,
	
		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 *  @type string
		 */
		"sName": null,
	
		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 *  @type string
		 *  @default std
		 */
		"sSortDataType": 'std',
	
		/**
		 * Class to be applied to the header element when sorting on this column
		 *  @type string
		 *  @default null
		 */
		"sSortingClass": null,
	
		/**
		 * Class to be applied to the header element when sorting on this column -
		 * when jQuery UI theming is used.
		 *  @type string
		 *  @default null
		 */
		"sSortingClassJUI": null,
	
		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 *  @type string
		 */
		"sTitle": null,
	
		/**
		 * Column sorting and filtering type
		 *  @type string
		 *  @default null
		 */
		"sType": null,
	
		/**
		 * Width of the column
		 *  @type string
		 *  @default null
		 */
		"sWidth": null,
	
		/**
		 * Width of the column when it was first "encountered"
		 *  @type string
		 *  @default null
		 */
		"sWidthOrig": null
	};
	
	
	/*
	 * Developer note: The properties of the object below are given in Hungarian
	 * notation, that was used as the interface for DataTables prior to v1.10, however
	 * from v1.10 onwards the primary interface is camel case. In order to avoid
	 * breaking backwards compatibility utterly with this change, the Hungarian
	 * version is still, internally the primary interface, but is is not documented
	 * - hence the @name tags in each doc comment. This allows a Javascript function
	 * to create a map from Hungarian notation to camel case (going the other direction
	 * would require each property to be listed, which would add around 3K to the size
	 * of DataTables, while this method is about a 0.5K hit).
	 *
	 * Ultimately this does pave the way for Hungarian notation to be dropped
	 * completely, but that is a massive amount of work and will break current
	 * installs (therefore is on-hold until v2).
	 */
	
	/**
	 * Initialisation options that can be given to DataTables at initialisation
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 *  @type array
		 *  @default null
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.data
		 *
		 *  @example
		 *    // Using a 2D array data source
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "data": [
		 *          ['Trident', 'Internet Explorer 4.0', 'Win 95+', 4, 'X'],
		 *          ['Trident', 'Internet Explorer 5.0', 'Win 95+', 5, 'C'],
		 *        ],
		 *        "columns": [
		 *          { "title": "Engine" },
		 *          { "title": "Browser" },
		 *          { "title": "Platform" },
		 *          { "title": "Version" },
		 *          { "title": "Grade" }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using an array of objects as a data source (`data`)
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "data": [
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 4.0",
		 *            "platform": "Win 95+",
		 *            "version":  4,
		 *            "grade":    "X"
		 *          },
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 5.0",
		 *            "platform": "Win 95+",
		 *            "version":  5,
		 *            "grade":    "C"
		 *          }
		 *        ],
		 *        "columns": [
		 *          { "title": "Engine",   "data": "engine" },
		 *          { "title": "Browser",  "data": "browser" },
		 *          { "title": "Platform", "data": "platform" },
		 *          { "title": "Version",  "data": "version" },
		 *          { "title": "Grade",    "data": "grade" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"aaData": null,
	
	
		/**
		 * If ordering is enabled, then DataTables will perform a first pass sort on
		 * initialisation. You can define which column(s) the sort is performed
		 * upon, and the sorting direction, with this variable. The `sorting` array
		 * should contain an array for each column to be sorted initially containing
		 * the column's index and a direction string ('asc' or 'desc').
		 *  @type array
		 *  @default [[0,'asc']]
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.order
		 *
		 *  @example
		 *    // Sort by 3rd column first, and then 4th column
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "order": [[2,'asc'], [3,'desc']]
		 *      } );
		 *    } );
		 *
		 *    // No initial sorting
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "order": []
		 *      } );
		 *    } );
		 */
		"aaSorting": [[0,'asc']],
	
	
		/**
		 * This parameter is basically identical to the `sorting` parameter, but
		 * cannot be overridden by user interaction with the table. What this means
		 * is that you could have a column (visible or hidden) which the sorting
		 * will always be forced on first - any sorting after that (from the user)
		 * will then be performed as required. This can be useful for grouping rows
		 * together.
		 *  @type array
		 *  @default null
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.orderFixed
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "orderFixed": [[0,'asc']]
		 *      } );
		 *    } )
		 */
		"aaSortingFixed": [],
	
	
		/**
		 * DataTables can be instructed to load data to display in the table from a
		 * Ajax source. This option defines how that Ajax call is made and where to.
		 *
		 * The `ajax` property has three different modes of operation, depending on
		 * how it is defined. These are:
		 *
		 * * `string` - Set the URL from where the data should be loaded from.
		 * * `object` - Define properties for `jQuery.ajax`.
		 * * `function` - Custom data get function
		 *
		 * `string`
		 * --------
		 *
		 * As a string, the `ajax` property simply defines the URL from which
		 * DataTables will load data.
		 *
		 * `object`
		 * --------
		 *
		 * As an object, the parameters in the object are passed to
		 * [jQuery.ajax](http://api.jquery.com/jQuery.ajax/) allowing fine control
		 * of the Ajax request. DataTables has a number of default parameters which
		 * you can override using this option. Please refer to the jQuery
		 * documentation for a full description of the options available, although
		 * the following parameters provide additional options in DataTables or
		 * require special consideration:
		 *
		 * * `data` - As with jQuery, `data` can be provided as an object, but it
		 *   can also be used as a function to manipulate the data DataTables sends
		 *   to the server. The function takes a single parameter, an object of
		 *   parameters with the values that DataTables has readied for sending. An
		 *   object may be returned which will be merged into the DataTables
		 *   defaults, or you can add the items to the object that was passed in and
		 *   not return anything from the function. This supersedes `fnServerParams`
		 *   from DataTables 1.9-.
		 *
		 * * `dataSrc` - By default DataTables will look for the property `data` (or
		 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
		 *   from an Ajax source or for server-side processing - this parameter
		 *   allows that property to be changed. You can use Javascript dotted
		 *   object notation to get a data source for multiple levels of nesting, or
		 *   it my be used as a function. As a function it takes a single parameter,
		 *   the JSON returned from the server, which can be manipulated as
		 *   required, with the returned value being that used by DataTables as the
		 *   data source for the table. This supersedes `sAjaxDataProp` from
		 *   DataTables 1.9-.
		 *
		 * * `success` - Should not be overridden it is used internally in
		 *   DataTables. To manipulate / transform the data returned by the server
		 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
		 *
		 * `function`
		 * ----------
		 *
		 * As a function, making the Ajax call is left up to yourself allowing
		 * complete control of the Ajax request. Indeed, if desired, a method other
		 * than Ajax could be used to obtain the required data, such as Web storage
		 * or an AIR database.
		 *
		 * The function is given four parameters and no return is required. The
		 * parameters are:
		 *
		 * 1. _object_ - Data to send to the server
		 * 2. _function_ - Callback function that must be executed when the required
		 *    data has been obtained. That data should be passed into the callback
		 *    as the only parameter
		 * 3. _object_ - DataTables settings object for the table
		 *
		 * Note that this supersedes `fnServerData` from DataTables 1.9-.
		 *
		 *  @type string|object|function
		 *  @default null
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.ajax
		 *  @since 1.10.0
		 *
		 * @example
		 *   // Get JSON data from a file via Ajax.
		 *   // Note DataTables expects data in the form `{ data: [ ...data... ] }` by default).
		 *   $('#example').dataTable( {
		 *     "ajax": "data.json"
		 *   } );
		 *
		 * @example
		 *   // Get JSON data from a file via Ajax, using `dataSrc` to change
		 *   // `data` to `tableData` (i.e. `{ tableData: [ ...data... ] }`)
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": "tableData"
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Get JSON data from a file via Ajax, using `dataSrc` to read data
		 *   // from a plain array rather than an array in an object
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": ""
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Manipulate the data returned from the server - add a link to data
		 *   // (note this can, should, be done using `render` for the column - this
		 *   // is just a simple example of how the data can be manipulated).
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": function ( json ) {
		 *         for ( var i=0, ien=json.length ; i<ien ; i++ ) {
		 *           json[i][0] = '<a href="/message/'+json[i][0]+'>View message</a>';
		 *         }
		 *         return json;
		 *       }
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Add data to the request
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "data": function ( d ) {
		 *         return {
		 *           "extra_search": $('#extra').val()
		 *         };
		 *       }
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Send request as POST
		 *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "type": "POST"
		 *     }
		 *   } );
		 *
		 * @example
		 *   // Get the data from localStorage (could interface with a form for
		 *   // adding, editing and removing rows).
		 *   $('#example').dataTable( {
		 *     "ajax": function (data, callback, settings) {
		 *       callback(
		 *         JSON.parse( localStorage.getItem('dataTablesData') )
		 *       );
		 *     }
		 *   } );
		 */
		"ajax": null,
	
	
		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be
		 * either a 1D array of options which will be used for both the displayed
		 * option and the value, or a 2D array which will use the array in the first
		 * position as the value, and the array in the second position as the
		 * displayed options (useful for language strings such as 'All').
		 *
		 * Note that the `pageLength` property will be automatically set to the
		 * first value given in this array, unless `pageLength` is also provided.
		 *  @type array
		 *  @default [ 10, 25, 50, 100 ]
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.lengthMenu
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
		 *      } );
		 *    } );
		 */
		"aLengthMenu": [ 10, 25, 50, 100 ],
	
	
		/**
		 * The `columns` option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see
		 * {@link DataTable.defaults.column}. Note that if you use `columns` to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 *  @member
		 *
		 *  @name DataTable.defaults.column
		 */
		"aoColumns": null,
	
		/**
		 * Very similar to `columns`, `columnDefs` allows you to target a specific
		 * column, multiple columns, or all columns, using the `targets` property of
		 * each object in the array. This allows great flexibility when creating
		 * tables, as the `columnDefs` arrays can be of any length, targeting the
		 * columns you specifically want. `columnDefs` may use any of the column
		 * options available: {@link DataTable.defaults.column}, but it _must_
		 * have `targets` defined in each object in the array. Values in the `targets`
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 *  @member
		 *
		 *  @name DataTable.defaults.columnDefs
		 */
		"aoColumnDefs": null,
	
	
		/**
		 * Basically the same as `search`, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size
		 * as the number of columns, and each element be an object with the parameters
		 * `search` and `escapeRegex` (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 *  @type array
		 *  @default []
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.searchCols
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "searchCols": [
		 *          null,
		 *          { "search": "My filter" },
		 *          null,
		 *          { "search": "^[0-9]", "escapeRegex": false }
		 *        ]
		 *      } );
		 *    } )
		 */
		"aoSearchCols": [],
	
	
		/**
		 * An array of CSS classes that should be applied to displayed rows. This
		 * array may be of any length, and DataTables will apply each class
		 * sequentially, looping when required.
		 *  @type array
		 *  @default null <i>Will take the values determined by the `oClasses.stripe*`
		 *    options</i>
		 *
		 *  @dtopt Option
		 *  @name DataTable.defaults.stripeClasses
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stripeClasses": [ 'strip1', 'strip2', 'strip3' ]
		 *      } );
		 *    } )
		 */
		"asStripeClasses": null,
	
	
		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using `columns`.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.autoWidth
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "autoWidth": false
		 *      } );
		 *    } );
		 */
		"bAutoWidth": true,
	
	
		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.deferRender
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajax": "sources/arrays.txt",
		 *        "deferRender": true
		 *      } );
		 *    } );
		 */
		"bDeferRender": false,
	
	
		/**
		 * Replace a DataTable which matches the given selector and replace it with
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.destroy
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "srollY": "200px",
		 *        "paginate": false
		 *      } );
		 *
		 *      // Some time later....
		 *      $('#example').dataTable( {
		 *        "filter": false,
		 *        "destroy": true
		 *      } );
		 *    } );
		 */
		"bDestroy": false,
	
	
		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * {@link DataTable.defaults.dom}.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.searching
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "searching": false
		 *      } );
		 *    } );
		 */
		"bFilter": true,
	
	
		/**
		 * Enable or disable the table information display. This shows information
		 * about the data that is currently visible on the page, including information
		 * about filtered data if that action is being performed.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.info
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "info": false
		 *      } );
		 *    } );
		 */
		"bInfo": true,
	
	
		/**
		 * Allows the end user to select the size of a formatted page from a select
		 * menu (sizes are 10, 25, 50 and 100). Requires pagination (`paginate`).
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.lengthChange
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "lengthChange": false
		 *      } );
		 *    } );
		 */
		"bLengthChange": true,
	
	
		/**
		 * Enable or disable pagination.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.paging
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "paging": false
		 *      } );
		 *    } );
		 */
		"bPaginate": true,
	
	
		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.processing
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "processing": true
		 *      } );
		 *    } );
		 */
		"bProcessing": false,
	
	
		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). `destroy` can be used to reinitialise a table if
		 * you need.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.retrieve
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      initTable();
		 *      tableActions();
		 *    } );
		 *
		 *    function initTable ()
		 *    {
		 *      return $('#example').dataTable( {
		 *        "scrollY": "200px",
		 *        "paginate": false,
		 *        "retrieve": true
		 *      } );
		 *    }
		 *
		 *    function tableActions ()
		 *    {
		 *      var table = initTable();
		 *      // perform API operations with oTable
		 *    }
		 */
		"bRetrieve": false,
	
	
		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.scrollCollapse
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollY": "200",
		 *        "scrollCollapse": true
		 *      } );
		 *    } );
		 */
		"bScrollCollapse": false,
	
	
		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * `ajax` parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.serverSide
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "serverSide": true,
		 *        "ajax": "xhr.php"
		 *      } );
		 *    } );
		 */
		"bServerSide": false,
	
	
		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the `sortable` option for each column.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.ordering
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "ordering": false
		 *      } );
		 *    } );
		 */
		"bSort": true,
	
	
		/**
		 * Enable or display DataTables' ability to sort multiple columns at the
		 * same time (activated by shift-click by the user).
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.orderMulti
		 *
		 *  @example
		 *    // Disable multiple column sorting ability
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "orderMulti": false
		 *      } );
		 *    } );
		 */
		"bSortMulti": true,
	
	
		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.orderCellsTop
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "orderCellsTop": true
		 *      } );
		 *    } );
		 */
		"bSortCellsTop": false,
	
	
		/**
		 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
		 * `sorting\_3` to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 *  @type boolean
		 *  @default true
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.orderClasses
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "orderClasses": false
		 *      } );
		 *    } );
		 */
		"bSortClasses": true,
	
	
		/**
		 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
		 * used to save table display information such as pagination information,
		 * display length, filtering and sorting. As such when the end user reloads
		 * the page the display display will match what thy had previously set up.
		 *
		 * Due to the use of `localStorage` the default state saving is not supported
		 * in IE6 or 7. If state saving is required in those browsers, use
		 * `stateSaveCallback` to provide a storage solution such as cookies.
		 *  @type boolean
		 *  @default false
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.stateSave
		 *
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "stateSave": true
		 *      } );
		 *    } );
		 */
		"bStateSave": false,
	
	
		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 *  @type function
		 *  @param {node} row "TR" element for the current row
		 *  @param {array} data Raw data array for this row
		 *  @param {int} dataIndex The index of this row in the internal aoData array
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.createdRow
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "createdRow": function( row, data, dataIndex ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( data[4] == "A" )
		 *          {
		 *            $('td:eq(4)', row).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnCreatedRow": null,
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.drawCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "drawCallback": function( settings ) {
		 *          alert( 'DataTables has redrawn the table' );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnDrawCallback": null,
	
	
		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' event.
		 *  @type function
		 *  @param {node} foot "TR" element for the footer
		 *  @param {array} data Full table data (as derived from the original HTML)
		 *  @param {int} start Index for the current display starting point in the
		 *    display array
		 *  @param {int} end Index for the current display ending point in the
		 *    display array
		 *  @param {array int} display Index array to translate the visual position
		 *    to the full data array
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.footerCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "footerCallback": function( tfoot, data, start, end, display ) {
		 *          tfoot.getElementsByTagName('th')[0].innerHTML = "Starting index is "+start;
		 *        }
		 *      } );
		 *    } )
		 */
		"fnFooterCallback": null,
	
	
		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 *  @type function
		 *  @member
		 *  @param {int} toFormat number to be formatted
		 *  @returns {string} formatted string for DataTables to show the number
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.formatNumber
		 *
		 *  @example
		 *    // Format a number using a single quote for the separator (note that
		 *    // this can also be done with the language.thousands option)
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "formatNumber": function ( toFormat ) {
		 *          return toFormat.toString().replace(
		 *            /\B(?=(\d{3})+(?!\d))/g, "'"
		 *          );
		 *        };
		 *      } );
		 *    } );
		 */
		"fnFormatNumber": function ( toFormat ) {
			return toFormat.toString().replace(
				/\B(?=(\d{3})+(?!\d))/g,
				this.oLanguage.sThousands
			);
		},
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 *  @type function
		 *  @param {node} head "TR" element for the header
		 *  @param {array} data Full table data (as derived from the original HTML)
		 *  @param {int} start Index for the current display starting point in the
		 *    display array
		 *  @param {int} end Index for the current display ending point in the
		 *    display array
		 *  @param {array int} display Index array to translate the visual position
		 *    to the full data array
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.headerCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fheaderCallback": function( head, data, start, end, display ) {
		 *          head.getElementsByTagName('th')[0].innerHTML = "Displaying "+(end-start)+" records";
		 *        }
		 *      } );
		 *    } )
		 */
		"fnHeaderCallback": null,
	
	
		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {int} start Starting position in data for the draw
		 *  @param {int} end End position in data for the draw
		 *  @param {int} max Total number of rows in the table (regardless of
		 *    filtering)
		 *  @param {int} total Total number of rows in the data set, after filtering
		 *  @param {string} pre The string that DataTables has formatted using it's
		 *    own rules
		 *  @returns {string} The string to be displayed in the information element.
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.infoCallback
		 *
		 *  @example
		 *    $('#example').dataTable( {
		 *      "infoCallback": function( settings, start, end, max, total, pre ) {
		 *        return start +" to "+ end;
		 *      }
		 *    } );
		 */
		"fnInfoCallback": null,
	
	
		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *  @param {object} json The JSON object request from the server - only
		 *    present if client-side Ajax sourced data is used
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.initComplete
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "initComplete": function(settings, json) {
		 *          alert( 'DataTables has finished its initialisation.' );
		 *        }
		 *      } );
		 *    } )
		 */
		"fnInitComplete": null,
	
	
		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *  @returns {boolean} False will cancel the draw, anything else (including no
		 *    return) will allow it to complete.
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.preDrawCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "preDrawCallback": function( settings ) {
		 *          if ( $('#test').val() == 1 ) {
		 *            return false;
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnPreDrawCallback": null,
	
	
		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 *  @type function
		 *  @param {node} row "TR" element for the current row
		 *  @param {array} data Raw data array for this row
		 *  @param {int} displayIndex The display index for the current table draw
		 *  @param {int} displayIndexFull The index of the data in the full list of
		 *    rows (after filtering)
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.rowCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "rowCallback": function( row, data, displayIndex, displayIndexFull ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( data[4] == "A" ) {
		 *            $('td:eq(4)', row).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnRowCallback": null,
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * This parameter allows you to override the default function which obtains
		 * the data from the server so something more suitable for your application.
		 * For example you could use POST data, or pull information from a Gears or
		 * AIR database.
		 *  @type function
		 *  @member
		 *  @param {string} source HTTP source to obtain the data from (`ajax`)
		 *  @param {array} data A key/value pair object containing the data to send
		 *    to the server
		 *  @param {function} callback to be called on completion of the data get
		 *    process that will draw the data on the page.
		 *  @param {object} settings DataTables settings object
		 *
		 *  @dtopt Callbacks
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.serverData
		 *
		 *  @deprecated 1.10. Please use `ajax` for this functionality now.
		 */
		"fnServerData": null,
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 *  It is often useful to send extra data to the server when making an Ajax
		 * request - for example custom filtering information, and this callback
		 * function makes it trivial to send extra information to the server. The
		 * passed in parameter is the data set that has been constructed by
		 * DataTables, and you can add to this or modify it as you require.
		 *  @type function
		 *  @param {array} data Data array (array of objects which are name/value
		 *    pairs) that has been constructed by DataTables and will be sent to the
		 *    server. In the case of Ajax sourced data with server-side processing
		 *    this will be an empty array, for server-side processing there will be a
		 *    significant number of parameters!
		 *  @returns {undefined} Ensure that you modify the data array passed in,
		 *    as this is passed by reference.
		 *
		 *  @dtopt Callbacks
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.serverParams
		 *
		 *  @deprecated 1.10. Please use `ajax` for this functionality now.
		 */
		"fnServerParams": null,
	
	
		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 *  @type function
		 *  @member
		 *  @param {object} settings DataTables settings object
		 *  @param {object} callback Callback that can be executed when done. It
		 *    should be passed the loaded state object.
		 *  @return {object} The DataTables state object to be loaded
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.stateLoadCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoadCallback": function (settings, callback) {
		 *          $.ajax( {
		 *            "url": "/state_load",
		 *            "dataType": "json",
		 *            "success": function (json) {
		 *              callback( json );
		 *            }
		 *          } );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateLoadCallback": function ( settings ) {
			try {
				return JSON.parse(
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
						'DataTables_'+settings.sInstance+'_'+location.pathname
					)
				);
			} catch (e) {
				return {};
			}
		},
	
	
		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for
		 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
		 * a plug-in.
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *  @param {object} data The state object that is to be loaded
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.stateLoadParams
		 *
		 *  @example
		 *    // Remove a saved filter, so filtering is never loaded
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoadParams": function (settings, data) {
		 *          data.oSearch.sSearch = "";
		 *        }
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Disallow state loading by returning false
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoadParams": function (settings, data) {
		 *          return false;
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateLoadParams": null,
	
	
		/**
		 * Callback that is called when the state has been loaded from the state saving method
		 * and the DataTables settings object has been modified as a result of the loaded state.
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *  @param {object} data The state object that was loaded
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.stateLoaded
		 *
		 *  @example
		 *    // Show an alert with the filtering value that was saved
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoaded": function (settings, data) {
		 *          alert( 'Saved filter was: '+data.oSearch.sSearch );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateLoaded": null,
	
	
		/**
		 * Save the table state. This function allows you to define where and how the state
		 * information for the table is stored By default DataTables will use `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 *  @type function
		 *  @member
		 *  @param {object} settings DataTables settings object
		 *  @param {object} data The state object to be saved
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.stateSaveCallback
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateSaveCallback": function (settings, data) {
		 *          // Send an Ajax request to the server with the state object
		 *          $.ajax( {
		 *            "url": "/state_save",
		 *            "data": data,
		 *            "dataType": "json",
		 *            "method": "POST"
		 *            "success": function () {}
		 *          } );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateSaveCallback": function ( settings, data ) {
			try {
				(settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
					'DataTables_'+settings.sInstance+'_'+location.pathname,
					JSON.stringify( data )
				);
			} catch (e) {}
		},
	
	
		/**
		 * Callback which allows modification of the state to be saved. Called when the table
		 * has changed state a new state save is required. This method allows modification of
		 * the state saving object prior to actually doing the save, including addition or
		 * other state properties or modification. Note that for plug-in authors, you should
		 * use the `stateSaveParams` event to save parameters for a plug-in.
		 *  @type function
		 *  @param {object} settings DataTables settings object
		 *  @param {object} data The state object to be saved
		 *
		 *  @dtopt Callbacks
		 *  @name DataTable.defaults.stateSaveParams
		 *
		 *  @example
		 *    // Remove a saved filter, so filtering is never saved
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateSaveParams": function (settings, data) {
		 *          data.oSearch.sSearch = "";
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateSaveParams": null,
	
	
		/**
		 * Duration for which the saved state information is considered valid. After this period
		 * has elapsed the state will be returned to the default.
		 * Value is given in seconds.
		 *  @type int
		 *  @default 7200 <i>(2 hours)</i>
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.stateDuration
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateDuration": 60*60*24; // 1 day
		 *      } );
		 *    } )
		 */
		"iStateDuration": 7200,
	
	
		/**
		 * When enabled DataTables will not make a request to the server for the first
		 * page draw - rather it will use the data already on the page (no sorting etc
		 * will be applied to it), thus saving on an XHR at load time. `deferLoading`
		 * is used to indicate that deferred loading is required, but it is also used
		 * to tell DataTables how many records there are in the full table (allowing
		 * the information element and pagination to be displayed correctly). In the case
		 * where a filtering is applied to the table on initial load, this can be
		 * indicated by giving the parameter as an array, where the first element is
		 * the number of records available after filtering and the second element is the
		 * number of records without filtering (allowing the table information element
		 * to be shown correctly).
		 *  @type int | array
		 *  @default null
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.deferLoading
		 *
		 *  @example
		 *    // 57 records available in the table, no filtering applied
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "serverSide": true,
		 *        "ajax": "scripts/server_processing.php",
		 *        "deferLoading": 57
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // 57 records after filtering, 100 without filtering (an initial filter applied)
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "serverSide": true,
		 *        "ajax": "scripts/server_processing.php",
		 *        "deferLoading": [ 57, 100 ],
		 *        "search": {
		 *          "search": "my_filter"
		 *        }
		 *      } );
		 *    } );
		 */
		"iDeferLoading": null,
	
	
		/**
		 * Number of rows to display on a single page when using pagination. If
		 * feature enabled (`lengthChange`) then the end user will be able to override
		 * this to a custom setting using a pop-up menu.
		 *  @type int
		 *  @default 10
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.pageLength
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "pageLength": 50
		 *      } );
		 *    } )
		 */
		"iDisplayLength": 10,
	
	
		/**
		 * Define the starting point for data display when using DataTables with
		 * pagination. Note that this parameter is the number of records, rather than
		 * the page number, so if you have 10 records per page and want to start on
		 * the third page, it should be "20".
		 *  @type int
		 *  @default 0
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.displayStart
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "displayStart": 20
		 *      } );
		 *    } )
		 */
		"iDisplayStart": 0,
	
	
		/**
		 * By default DataTables allows keyboard navigation of the table (sorting, paging,
		 * and filtering) by adding a `tabindex` attribute to the required elements. This
		 * allows you to tab through the controls and press the enter key to activate them.
		 * The tabindex is default 0, meaning that the tab follows the flow of the document.
		 * You can overrule this using this parameter if you wish. Use a value of -1 to
		 * disable built-in keyboard navigation.
		 *  @type int
		 *  @default 0
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.tabIndex
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "tabIndex": 1
		 *      } );
		 *    } );
		 */
		"iTabIndex": 0,
	
	
		/**
		 * Classes that DataTables assigns to the various components and features
		 * that it adds to the HTML table. This allows classes to be configured
		 * during initialisation in addition to through the static
		 * {@link DataTable.ext.oStdClasses} object).
		 *  @namespace
		 *  @name DataTable.defaults.classes
		 */
		"oClasses": {},
	
	
		/**
		 * All strings that DataTables uses in the user interface that it creates
		 * are defined in this object, allowing you to modified them individually or
		 * completely replace them all as required.
		 *  @namespace
		 *  @name DataTable.defaults.language
		 */
		"oLanguage": {
			/**
			 * Strings that are used for WAI-ARIA labels and controls only (these are not
			 * actually visible on the page, but will be read by screenreaders, and thus
			 * must be internationalised as well).
			 *  @namespace
			 *  @name DataTable.defaults.language.aria
			 */
			"oAria": {
				/**
				 * ARIA label that is added to the table headers when the column may be
				 * sorted ascending by activing the column (click or return when focused).
				 * Note that the column header is prefixed to this string.
				 *  @type string
				 *  @default : activate to sort column ascending
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.aria.sortAscending
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "aria": {
				 *            "sortAscending": " - click/return to sort ascending"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sSortAscending": ": activate to sort column ascending",
	
				/**
				 * ARIA label that is added to the table headers when the column may be
				 * sorted descending by activing the column (click or return when focused).
				 * Note that the column header is prefixed to this string.
				 *  @type string
				 *  @default : activate to sort column ascending
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.aria.sortDescending
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "aria": {
				 *            "sortDescending": " - click/return to sort descending"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sSortDescending": ": activate to sort column descending"
			},
	
			/**
			 * Pagination string used by DataTables for the built-in pagination
			 * control types.
			 *  @namespace
			 *  @name DataTable.defaults.language.paginate
			 */
			"oPaginate": {
				/**
				 * Text to use when using the 'full_numbers' type of pagination for the
				 * button to take the user to the first page.
				 *  @type string
				 *  @default First
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.paginate.first
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "paginate": {
				 *            "first": "First page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sFirst": "First",
	
	
				/**
				 * Text to use when using the 'full_numbers' type of pagination for the
				 * button to take the user to the last page.
				 *  @type string
				 *  @default Last
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.paginate.last
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "paginate": {
				 *            "last": "Last page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sLast": "Last",
	
	
				/**
				 * Text to use for the 'next' pagination button (to take the user to the
				 * next page).
				 *  @type string
				 *  @default Next
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.paginate.next
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "paginate": {
				 *            "next": "Next page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sNext": "Next",
	
	
				/**
				 * Text to use for the 'previous' pagination button (to take the user to
				 * the previous page).
				 *  @type string
				 *  @default Previous
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.paginate.previous
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "paginate": {
				 *            "previous": "Previous page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sPrevious": "Previous"
			},
	
			/**
			 * This string is shown in preference to `zeroRecords` when the table is
			 * empty of data (regardless of filtering). Note that this is an optional
			 * parameter - if it is not given, the value of `zeroRecords` will be used
			 * instead (either the default or given value).
			 *  @type string
			 *  @default No data available in table
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.emptyTable
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "emptyTable": "No data available in table"
			 *        }
			 *      } );
			 *    } );
			 */
			"sEmptyTable": "No data available in table",
	
	
			/**
			 * This string gives information to the end user about the information
			 * that is current on display on the page. The following tokens can be
			 * used in the string and will be dynamically replaced as the table
			 * display updates. This tokens can be placed anywhere in the string, or
			 * removed as needed by the language requires:
			 *
			 * * `\_START\_` - Display index of the first record on the current page
			 * * `\_END\_` - Display index of the last record on the current page
			 * * `\_TOTAL\_` - Number of records in the table after filtering
			 * * `\_MAX\_` - Number of records in the table without filtering
			 * * `\_PAGE\_` - Current page number
			 * * `\_PAGES\_` - Total number of pages of data in the table
			 *
			 *  @type string
			 *  @default Showing _START_ to _END_ of _TOTAL_ entries
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.info
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "info": "Showing page _PAGE_ of _PAGES_"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
	
	
			/**
			 * Display information string for when the table is empty. Typically the
			 * format of this string should match `info`.
			 *  @type string
			 *  @default Showing 0 to 0 of 0 entries
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.infoEmpty
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "infoEmpty": "No entries to show"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoEmpty": "Showing 0 to 0 of 0 entries",
	
	
			/**
			 * When a user filters the information in a table, this string is appended
			 * to the information (`info`) to give an idea of how strong the filtering
			 * is. The variable _MAX_ is dynamically updated.
			 *  @type string
			 *  @default (filtered from _MAX_ total entries)
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.infoFiltered
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "infoFiltered": " - filtering from _MAX_ records"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoFiltered": "(filtered from _MAX_ total entries)",
	
	
			/**
			 * If can be useful to append extra information to the info string at times,
			 * and this variable does exactly that. This information will be appended to
			 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
			 * being used) at all times.
			 *  @type string
			 *  @default <i>Empty string</i>
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.infoPostFix
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "infoPostFix": "All records shown are derived from real information."
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoPostFix": "",
	
	
			/**
			 * This decimal place operator is a little different from the other
			 * language options since DataTables doesn't output floating point
			 * numbers, so it won't ever use this for display of a number. Rather,
			 * what this parameter does is modify the sort methods of the table so
			 * that numbers which are in a format which has a character other than
			 * a period (`.`) as a decimal place will be sorted numerically.
			 *
			 * Note that numbers with different decimal places cannot be shown in
			 * the same table and still be sortable, the table must be consistent.
			 * However, multiple different tables on the page can use different
			 * decimal place characters.
			 *  @type string
			 *  @default 
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.decimal
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "decimal": ","
			 *          "thousands": "."
			 *        }
			 *      } );
			 *    } );
			 */
			"sDecimal": "",
	
	
			/**
			 * DataTables has a build in number formatter (`formatNumber`) which is
			 * used to format large numbers that are used in the table information.
			 * By default a comma is used, but this can be trivially changed to any
			 * character you wish with this parameter.
			 *  @type string
			 *  @default ,
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.thousands
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "thousands": "'"
			 *        }
			 *      } );
			 *    } );
			 */
			"sThousands": ",",
	
	
			/**
			 * Detail the action that will be taken when the drop down menu for the
			 * pagination length option is changed. The '_MENU_' variable is replaced
			 * with a default select list of 10, 25, 50 and 100, and can be replaced
			 * with a custom select box if required.
			 *  @type string
			 *  @default Show _MENU_ entries
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.lengthMenu
			 *
			 *  @example
			 *    // Language change only
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "lengthMenu": "Display _MENU_ records"
			 *        }
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Language and options change
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "lengthMenu": 'Display <select>'+
			 *            '<option value="10">10</option>'+
			 *            '<option value="20">20</option>'+
			 *            '<option value="30">30</option>'+
			 *            '<option value="40">40</option>'+
			 *            '<option value="50">50</option>'+
			 *            '<option value="-1">All</option>'+
			 *            '</select> records'
			 *        }
			 *      } );
			 *    } );
			 */
			"sLengthMenu": "Show _MENU_ entries",
	
	
			/**
			 * When using Ajax sourced data and during the first draw when DataTables is
			 * gathering the data, this message is shown in an empty row in the table to
			 * indicate to the end user the the data is being loaded. Note that this
			 * parameter is not used when loading data by server-side processing, just
			 * Ajax sourced data with client-side processing.
			 *  @type string
			 *  @default Loading...
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.loadingRecords
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "loadingRecords": "Please wait - loading..."
			 *        }
			 *      } );
			 *    } );
			 */
			"sLoadingRecords": "Loading...",
	
	
			/**
			 * Text which is displayed when the table is processing a user action
			 * (usually a sort command or similar).
			 *  @type string
			 *  @default Processing...
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.processing
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "processing": "DataTables is currently busy"
			 *        }
			 *      } );
			 *    } );
			 */
			"sProcessing": "Processing...",
	
	
			/**
			 * Details the actions that will be taken when the user types into the
			 * filtering input text box. The variable "_INPUT_", if used in the string,
			 * is replaced with the HTML text box for the filtering input allowing
			 * control over where it appears in the string. If "_INPUT_" is not given
			 * then the input box is appended to the string automatically.
			 *  @type string
			 *  @default Search:
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.search
			 *
			 *  @example
			 *    // Input text box will be appended at the end automatically
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "search": "Filter records:"
			 *        }
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Specify where the filter should appear
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "search": "Apply filter _INPUT_ to table"
			 *        }
			 *      } );
			 *    } );
			 */
			"sSearch": "Search:",
	
	
			/**
			 * Assign a `placeholder` attribute to the search `input` element
			 *  @type string
			 *  @default 
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.searchPlaceholder
			 */
			"sSearchPlaceholder": "",
	
	
			/**
			 * All of the language information can be stored in a file on the
			 * server-side, which DataTables will look up if this parameter is passed.
			 * It must store the URL of the language file, which is in a JSON format,
			 * and the object has the same properties as the oLanguage object in the
			 * initialiser object (i.e. the above parameters). Please refer to one of
			 * the example language files to see how this works in action.
			 *  @type string
			 *  @default <i>Empty string - i.e. disabled</i>
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.url
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "url": "http://www.sprymedia.co.uk/dataTables/lang.txt"
			 *        }
			 *      } );
			 *    } );
			 */
			"sUrl": "",
	
	
			/**
			 * Text shown inside the table records when the is no information to be
			 * displayed after filtering. `emptyTable` is shown when there is simply no
			 * information in the table at all (regardless of filtering).
			 *  @type string
			 *  @default No matching records found
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.zeroRecords
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "zeroRecords": "No records to display"
			 *        }
			 *      } );
			 *    } );
			 */
			"sZeroRecords": "No matching records found"
		},
	
	
		/**
		 * This parameter allows you to have define the global filtering state at
		 * initialisation time. As an object the `search` parameter must be
		 * defined, but all other parameters are optional. When `regex` is true,
		 * the search string will be treated as a regular expression, when false
		 * (default) it will be treated as a straight string. When `smart`
		 * DataTables will use it's smart filtering methods (to word match at
		 * any point in the data), when false this will not be done.
		 *  @namespace
		 *  @extends DataTable.models.oSearch
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.search
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "search": {"search": "Initial search"}
		 *      } );
		 *    } )
		 */
		"oSearch": $.extend( {}, DataTable.models.oSearch ),
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * By default DataTables will look for the property `data` (or `aaData` for
		 * compatibility with DataTables 1.9-) when obtaining data from an Ajax
		 * source or for server-side processing - this parameter allows that
		 * property to be changed. You can use Javascript dotted object notation to
		 * get a data source for multiple levels of nesting.
		 *  @type string
		 *  @default data
		 *
		 *  @dtopt Options
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.ajaxDataProp
		 *
		 *  @deprecated 1.10. Please use `ajax` for this functionality now.
		 */
		"sAjaxDataProp": "data",
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * You can instruct DataTables to load data from an external
		 * source using this parameter (use aData if you want to pass data in you
		 * already have). Simply provide a url a JSON object can be obtained from.
		 *  @type string
		 *  @default null
		 *
		 *  @dtopt Options
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.ajaxSource
		 *
		 *  @deprecated 1.10. Please use `ajax` for this functionality now.
		 */
		"sAjaxSource": null,
	
	
		/**
		 * This initialisation variable allows you to specify exactly where in the
		 * DOM you want DataTables to inject the various controls it adds to the page
		 * (for example you might want the pagination controls at the top of the
		 * table). DIV elements (with or without a custom class) can also be added to
		 * aid styling. The follow syntax is used:
		 *   <ul>
		 *     <li>The following options are allowed:
		 *       <ul>
		 *         <li>'l' - Length changing</li>
		 *         <li>'f' - Filtering input</li>
		 *         <li>'t' - The table!</li>
		 *         <li>'i' - Information</li>
		 *         <li>'p' - Pagination</li>
		 *         <li>'r' - pRocessing</li>
		 *       </ul>
		 *     </li>
		 *     <li>The following constants are allowed:
		 *       <ul>
		 *         <li>'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')</li>
		 *         <li>'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')</li>
		 *       </ul>
		 *     </li>
		 *     <li>The following syntax is expected:
		 *       <ul>
		 *         <li>'&lt;' and '&gt;' - div elements</li>
		 *         <li>'&lt;"class" and '&gt;' - div with a class</li>
		 *         <li>'&lt;"#id" and '&gt;' - div with an ID</li>
		 *       </ul>
		 *     </li>
		 *     <li>Examples:
		 *       <ul>
		 *         <li>'&lt;"wrapper"flipt&gt;'</li>
		 *         <li>'&lt;lf&lt;t&gt;ip&gt;'</li>
		 *       </ul>
		 *     </li>
		 *   </ul>
		 *  @type string
		 *  @default lfrtip <i>(when `jQueryUI` is false)</i> <b>or</b>
		 *    <"H"lfr>t<"F"ip> <i>(when `jQueryUI` is true)</i>
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.dom
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "dom": '&lt;"top"i&gt;rt&lt;"bottom"flp&gt;&lt;"clear"&gt;'
		 *      } );
		 *    } );
		 */
		"sDom": "lfrtip",
	
	
		/**
		 * Search delay option. This will throttle full table searches that use the
		 * DataTables provided search input element (it does not effect calls to
		 * `dt-api search()`, providing a delay before the search is made.
		 *  @type integer
		 *  @default 0
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.searchDelay
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "searchDelay": 200
		 *      } );
		 *    } )
		 */
		"searchDelay": null,
	
	
		/**
		 * DataTables features six different built-in options for the buttons to
		 * display for pagination control:
		 *
		 * * `numbers` - Page number buttons only
		 * * `simple` - 'Previous' and 'Next' buttons only
		 * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
		 * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
		 * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
		 * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
		 *  
		 * Further methods can be added using {@link DataTable.ext.oPagination}.
		 *  @type string
		 *  @default simple_numbers
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.pagingType
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "pagingType": "full_numbers"
		 *      } );
		 *    } )
		 */
		"sPaginationType": "simple_numbers",
	
	
		/**
		 * Enable horizontal scrolling. When a table is too wide to fit into a
		 * certain layout, or you have a large number of columns in the table, you
		 * can enable x-scrolling to show the table in a viewport, which can be
		 * scrolled. This property can be `true` which will allow the table to
		 * scroll horizontally when needed, or any CSS unit, or a number (in which
		 * case it will be treated as a pixel measurement). Setting as simply `true`
		 * is recommended.
		 *  @type boolean|string
		 *  @default <i>blank string - i.e. disabled</i>
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.scrollX
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollX": true,
		 *        "scrollCollapse": true
		 *      } );
		 *    } );
		 */
		"sScrollX": "",
	
	
		/**
		 * This property can be used to force a DataTable to use more width than it
		 * might otherwise do when x-scrolling is enabled. For example if you have a
		 * table which requires to be well spaced, this parameter is useful for
		 * "over-sizing" the table, and thus forcing scrolling. This property can by
		 * any CSS unit, or a number (in which case it will be treated as a pixel
		 * measurement).
		 *  @type string
		 *  @default <i>blank string - i.e. disabled</i>
		 *
		 *  @dtopt Options
		 *  @name DataTable.defaults.scrollXInner
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollX": "100%",
		 *        "scrollXInner": "110%"
		 *      } );
		 *    } );
		 */
		"sScrollXInner": "",
	
	
		/**
		 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
		 * to the given height, and enable scrolling for any data which overflows the
		 * current viewport. This can be used as an alternative to paging to display
		 * a lot of data in a small area (although paging and scrolling can both be
		 * enabled at the same time). This property can be any CSS unit, or a number
		 * (in which case it will be treated as a pixel measurement).
		 *  @type string
		 *  @default <i>blank string - i.e. disabled</i>
		 *
		 *  @dtopt Features
		 *  @name DataTable.defaults.scrollY
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollY": "200px",
		 *        "paginate": false
		 *      } );
		 *    } );
		 */
		"sScrollY": "",
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * Set the HTTP method that is used to make the Ajax call for server-side
		 * processing or Ajax sourced data.
		 *  @type string
		 *  @default GET
		 *
		 *  @dtopt Options
		 *  @dtopt Server-side
		 *  @name DataTable.defaults.serverMethod
		 *
		 *  @deprecated 1.10. Please use `ajax` for this functionality now.
		 */
		"sServerMethod": "GET",
	
	
		/**
		 * DataTables makes use of renderers when displaying HTML elements for
		 * a table. These renderers can be added or modified by plug-ins to
		 * generate suitable mark-up for a site. For example the Bootstrap
		 * integration plug-in for DataTables uses a paging button renderer to
		 * display pagination buttons in the mark-up required by Bootstrap.
		 *
		 * For further information about the renderers available see
		 * DataTable.ext.renderer
		 *  @type string|object
		 *  @default null
		 *
		 *  @name DataTable.defaults.renderer
		 *
		 */
		"renderer": null,
	
	
		/**
		 * Set the data property name that DataTables should use to get a row's id
		 * to set as the `id` property in the node.
		 *  @type string
		 *  @default DT_RowId
		 *
		 *  @name DataTable.defaults.rowId
		 */
		"rowId": "DT_RowId"
	};
	
	_fnHungarianMap( DataTable.defaults );
	
	
	
	/*
	 * Developer note - See note in model.defaults.js about the use of Hungarian
	 * notation and camel case.
	 */
	
	/**
	 * Column options that can be given to DataTables at initialisation time.
	 *  @namespace
	 */
	DataTable.defaults.column = {
		/**
		 * Define which column(s) an order will occur on for this column. This
		 * allows a column's ordering to take multiple columns into account when
		 * doing a sort or use the data from a different column. For example first
		 * name / last name columns make sense to do a multi-column sort over the
		 * two columns.
		 *  @type array|int
		 *  @default null <i>Takes the value of the column index automatically</i>
		 *
		 *  @name DataTable.defaults.column.orderData
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "orderData": [ 0, 1 ], "targets": [ 0 ] },
		 *          { "orderData": [ 1, 0 ], "targets": [ 1 ] },
		 *          { "orderData": 2, "targets": [ 2 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "orderData": [ 0, 1 ] },
		 *          { "orderData": [ 1, 0 ] },
		 *          { "orderData": 2 },
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"aDataSort": null,
		"iDataSort": -1,
	
	
		/**
		 * You can control the default ordering direction, and even alter the
		 * behaviour of the sort handler (i.e. only allow ascending ordering etc)
		 * using this parameter.
		 *  @type array
		 *  @default [ 'asc', 'desc' ]
		 *
		 *  @name DataTable.defaults.column.orderSequence
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "orderSequence": [ "asc" ], "targets": [ 1 ] },
		 *          { "orderSequence": [ "desc", "asc", "asc" ], "targets": [ 2 ] },
		 *          { "orderSequence": [ "desc" ], "targets": [ 3 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          { "orderSequence": [ "asc" ] },
		 *          { "orderSequence": [ "desc", "asc", "asc" ] },
		 *          { "orderSequence": [ "desc" ] },
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"asSorting": [ 'asc', 'desc' ],
	
	
		/**
		 * Enable or disable filtering on the data in this column.
		 *  @type boolean
		 *  @default true
		 *
		 *  @name DataTable.defaults.column.searchable
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "searchable": false, "targets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "searchable": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bSearchable": true,
	
	
		/**
		 * Enable or disable ordering on this column.
		 *  @type boolean
		 *  @default true
		 *
		 *  @name DataTable.defaults.column.orderable
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "orderable": false, "targets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "orderable": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bSortable": true,
	
	
		/**
		 * Enable or disable the display of this column.
		 *  @type boolean
		 *  @default true
		 *
		 *  @name DataTable.defaults.column.visible
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "visible": false, "targets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "visible": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bVisible": true,
	
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 *  @type function
		 *  @param {element} td The TD node that has been created
		 *  @param {*} cellData The Data for the cell
		 *  @param {array|object} rowData The data for the whole row
		 *  @param {int} row The row index for the aoData data store
		 *  @param {int} col The column index for aoColumns
		 *
		 *  @name DataTable.defaults.column.createdCell
		 *  @dtopt Columns
		 *
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [3],
		 *          "createdCell": function (td, cellData, rowData, row, col) {
		 *            if ( cellData == "1.7" ) {
		 *              $(td).css('color', 'blue')
		 *            }
		 *          }
		 *        } ]
		 *      });
		 *    } );
		 */
		"fnCreatedCell": null,
	
	
		/**
		 * This parameter has been replaced by `data` in DataTables to ensure naming
		 * consistency. `dataProp` can still be used, as there is backwards
		 * compatibility in DataTables for this option, but it is strongly
		 * recommended that you use `data` in preference to `dataProp`.
		 *  @name DataTable.defaults.column.dataProp
		 */
	
	
		/**
		 * This property can be used to read data from any data source property,
		 * including deeply nested objects / properties. `data` can be given in a
		 * number of different ways which effect its behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object. Note that
		 *      function notation is recommended for use in `render` rather than
		 *      `data` as it is much simpler to use as a renderer.
		 * * `null` - use the original data source for the row rather than plucking
		 *   data directly from it. This action has effects on two other
		 *   initialisation options:
		 *    * `defaultContent` - When null is given as the `data` option and
		 *      `defaultContent` is specified for the column, the value defined by
		 *      `defaultContent` will be used for the cell.
		 *    * `render` - When null is used for the `data` option and the `render`
		 *      option is specified for the column, the whole data source for the
		 *      row is used for the renderer.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * `{array|object}` The data source for the row
		 *      * `{string}` The type call data requested - this will be 'set' when
		 *        setting data or 'filter', 'display', 'type', 'sort' or undefined
		 *        when gathering data. Note that when `undefined` is given for the
		 *        type DataTables expects to get the raw data for the object back<
		 *      * `{*}` Data to set when the second parameter is 'set'.
		 *    * Return:
		 *      * The return value from the function is not required when 'set' is
		 *        the type of call, but otherwise the return is what will be used
		 *        for the data requested.
		 *
		 * Note that `data` is a getter and setter option. If you just require
		 * formatting of data for output, you will likely want to use `render` which
		 * is simply a getter and thus simpler to use.
		 *
		 * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
		 * name change reflects the flexibility of this property and is consistent
		 * with the naming of mRender. If 'mDataProp' is given, then it will still
		 * be used by DataTables, as it automatically maps the old name to the new
		 * if required.
		 *
		 *  @type string|int|function|null
		 *  @default null <i>Use automatically calculated column index</i>
		 *
		 *  @name DataTable.defaults.column.data
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Read table data from objects
		 *    // JSON structure for each row:
		 *    //   {
		 *    //      "engine": {value},
		 *    //      "browser": {value},
		 *    //      "platform": {value},
		 *    //      "version": {value},
		 *    //      "grade": {value}
		 *    //   }
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajaxSource": "sources/objects.txt",
		 *        "columns": [
		 *          { "data": "engine" },
		 *          { "data": "browser" },
		 *          { "data": "platform" },
		 *          { "data": "version" },
		 *          { "data": "grade" }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Read information from deeply nested objects
		 *    // JSON structure for each row:
		 *    //   {
		 *    //      "engine": {value},
		 *    //      "browser": {value},
		 *    //      "platform": {
		 *    //         "inner": {value}
		 *    //      },
		 *    //      "details": [
		 *    //         {value}, {value}
		 *    //      ]
		 *    //   }
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajaxSource": "sources/deep.txt",
		 *        "columns": [
		 *          { "data": "engine" },
		 *          { "data": "browser" },
		 *          { "data": "platform.inner" },
		 *          { "data": "details.0" },
		 *          { "data": "details.1" }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `data` as a function to provide different information for
		 *    // sorting, filtering and display. In this case, currency (price)
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": function ( source, type, val ) {
		 *            if (type === 'set') {
		 *              source.price = val;
		 *              // Store the computed dislay and filter values for efficiency
		 *              source.price_display = val=="" ? "" : "$"+numberFormat(val);
		 *              source.price_filter  = val=="" ? "" : "$"+numberFormat(val)+" "+val;
		 *              return;
		 *            }
		 *            else if (type === 'display') {
		 *              return source.price_display;
		 *            }
		 *            else if (type === 'filter') {
		 *              return source.price_filter;
		 *            }
		 *            // 'sort', 'type' and undefined all just use the integer
		 *            return source.price;
		 *          }
		 *        } ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using default content
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null,
		 *          "defaultContent": "Click to edit"
		 *        } ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using array notation - outputting a list from an array
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": "name[, ]"
		 *        } ]
		 *      } );
		 *    } );
		 *
		 */
		"mData": null,
	
	
		/**
		 * This property is the rendering partner to `data` and it is suggested that
		 * when you want to manipulate data for display (including filtering,
		 * sorting etc) without altering the underlying data for the table, use this
		 * property. `render` can be considered to be the the read only companion to
		 * `data` which is read / write (then as such more complex). Like `data`
		 * this option can be given in a number of different ways to effect its
		 * behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object.
		 * * `object` - use different data for the different data types requested by
		 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
		 *   of the object is the data type the property refers to and the value can
		 *   defined using an integer, string or function using the same rules as
		 *   `render` normally does. Note that an `_` option _must_ be specified.
		 *   This is the default value to use if you haven't specified a value for
		 *   the data type requested by DataTables.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * {array|object} The data source for the row (based on `data`)
		 *      * {string} The type call data requested - this will be 'filter',
		 *        'display', 'type' or 'sort'.
		 *      * {array|object} The full data source for the row (not based on
		 *        `data`)
		 *    * Return:
		 *      * The return value from the function is what will be used for the
		 *        data requested.
		 *
		 *  @type string|int|function|object|null
		 *  @default null Use the data source value.
		 *
		 *  @name DataTable.defaults.column.render
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Create a comma separated list from an array of objects
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajaxSource": "sources/deep.txt",
		 *        "columns": [
		 *          { "data": "engine" },
		 *          { "data": "browser" },
		 *          {
		 *            "data": "platform",
		 *            "render": "[, ].name"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Execute a function to obtain data
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null, // Use the full data source object for the renderer's source
		 *          "render": "browserName()"
		 *        } ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // As an object, extracting different data for the different types
		 *    // This would be used with a data source such as:
		 *    //   { "phone": 5552368, "phone_filter": "5552368 555-2368", "phone_display": "555-2368" }
		 *    // Here the `phone` integer is used for sorting and type detection, while `phone_filter`
		 *    // (which has both forms) is used for filtering for if a user inputs either format, while
		 *    // the formatted phone number is the one that is shown in the table.
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null, // Use the full data source object for the renderer's source
		 *          "render": {
		 *            "_": "phone",
		 *            "filter": "phone_filter",
		 *            "display": "phone_display"
		 *          }
		 *        } ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Use as a function to create a link from the data source
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": "download_link",
		 *          "render": function ( data, type, full ) {
		 *            return '<a href="'+data+'">Download</a>';
		 *          }
		 *        } ]
		 *      } );
		 *    } );
		 */
		"mRender": null,
	
	
		/**
		 * Change the cell type created for the column - either TD cells or TH cells. This
		 * can be useful as TH cells have semantic meaning in the table body, allowing them
		 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
		 *  @type string
		 *  @default td
		 *
		 *  @name DataTable.defaults.column.cellType
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Make the first column use TH cells
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "cellType": "th"
		 *        } ]
		 *      } );
		 *    } );
		 */
		"sCellType": "td",
	
	
		/**
		 * Class to give to each cell in this column.
		 *  @type string
		 *  @default <i>Empty string</i>
		 *
		 *  @name DataTable.defaults.column.class
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "class": "my_class", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "class": "my_class" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sClass": "",
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this!
		 *  @type string
		 *  @default <i>Empty string<i>
		 *
		 *  @name DataTable.defaults.column.contentPadding
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "contentPadding": "mmm"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sContentPadding": "",
	
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because `data`
		 * is set to null, or because the data source itself is null).
		 *  @type string
		 *  @default null
		 *
		 *  @name DataTable.defaults.column.defaultContent
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          {
		 *            "data": null,
		 *            "defaultContent": "Edit",
		 *            "targets": [ -1 ]
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "data": null,
		 *            "defaultContent": "Edit"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sDefaultContent": null,
	
	
		/**
		 * This parameter is only used in DataTables' server-side processing. It can
		 * be exceptionally useful to know what columns are being displayed on the
		 * client side, and to map these to database fields. When defined, the names
		 * also allow DataTables to reorder information from the server if it comes
		 * back in an unexpected order (i.e. if you switch your columns around on the
		 * client-side, your server-side code does not also need updating).
		 *  @type string
		 *  @default <i>Empty string</i>
		 *
		 *  @name DataTable.defaults.column.name
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "name": "engine", "targets": [ 0 ] },
		 *          { "name": "browser", "targets": [ 1 ] },
		 *          { "name": "platform", "targets": [ 2 ] },
		 *          { "name": "version", "targets": [ 3 ] },
		 *          { "name": "grade", "targets": [ 4 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "name": "engine" },
		 *          { "name": "browser" },
		 *          { "name": "platform" },
		 *          { "name": "version" },
		 *          { "name": "grade" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sName": "",
	
	
		/**
		 * Defines a data source type for the ordering which can be used to read
		 * real-time information from the table (updating the internally cached
		 * version) prior to ordering. This allows ordering to occur on user
		 * editable elements such as form inputs.
		 *  @type string
		 *  @default std
		 *
		 *  @name DataTable.defaults.column.orderDataType
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "orderDataType": "dom-text", "targets": [ 2, 3 ] },
		 *          { "type": "numeric", "targets": [ 3 ] },
		 *          { "orderDataType": "dom-select", "targets": [ 4 ] },
		 *          { "orderDataType": "dom-checkbox", "targets": [ 5 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          null,
		 *          { "orderDataType": "dom-text" },
		 *          { "orderDataType": "dom-text", "type": "numeric" },
		 *          { "orderDataType": "dom-select" },
		 *          { "orderDataType": "dom-checkbox" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sSortDataType": "std",
	
	
		/**
		 * The title of this column.
		 *  @type string
		 *  @default null <i>Derived from the 'TH' value for this column in the
		 *    original HTML table.</i>
		 *
		 *  @name DataTable.defaults.column.title
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "title": "My column title", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "title": "My column title" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sTitle": null,
	
	
		/**
		 * The type allows you to specify how the data for this column will be
		 * ordered. Four types (string, numeric, date and html (which will strip
		 * HTML tags before ordering)) are currently available. Note that only date
		 * formats understood by Javascript's Date() object will be accepted as type
		 * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
		 * 'numeric', 'date' or 'html' (by default). Further types can be adding
		 * through plug-ins.
		 *  @type string
		 *  @default null <i>Auto-detected from raw data</i>
		 *
		 *  @name DataTable.defaults.column.type
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "type": "html", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "type": "html" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sType": null,
	
	
		/**
		 * Defining the width of the column, this parameter may take any CSS value
		 * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
		 * been given a specific width through this interface ensuring that the table
		 * remains readable.
		 *  @type string
		 *  @default null <i>Automatic</i>
		 *
		 *  @name DataTable.defaults.column.width
		 *  @dtopt Columns
		 *
		 *  @example
		 *    // Using `columnDefs`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "width": "20%", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Using `columns`
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "width": "20%" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sWidth": null
	};
	
	_fnHungarianMap( DataTable.defaults.column );
	
	
	
	/**
	 * DataTables settings object - this holds all the information needed for a
	 * given table, including configuration, data and current application of the
	 * table options. DataTables does not have a single instance for each DataTable
	 * with the settings attached to that instance, but rather instances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 *
	 * Note that this object is related to {@link DataTable.defaults} but this
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 *  @namespace
	 *  @todo Really should attach the settings object to individual instances so we
	 *    don't need to create new instances on each $().dataTable() call (if the
	 *    table already exists). It would also save passing oSettings around and
	 *    into every single function. However, this is a very significant
	 *    architecture change for DataTables and will almost certainly break
	 *    backwards compatibility with older installations. This is something that
	 *    will be done in 2.0.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 *  @namespace
		 */
		"oFeatures": {
	
			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bAutoWidth": null,
	
			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all fro DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bDeferRender": null,
	
			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bFilter": null,
	
			/**
			 * Table information element (the 'Showing x of y records' div) enable
			 * flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bInfo": null,
	
			/**
			 * Present a user control allowing the end user to change the page size
			 * when pagination is enabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bLengthChange": null,
	
			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bPaginate": null,
	
			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bProcessing": null,
	
			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bServerSide": null,
	
			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSort": null,
	
			/**
			 * Multi-column sorting
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSortMulti": null,
	
			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSortClasses": null,
	
			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bStateSave": null
		},
	
	
		/**
		 * Scrolling settings for a table.
		 *  @namespace
		 */
		"oScroll": {
			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bCollapse": null,
	
			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 *  @type int
			 *  @default 0
			 */
			"iBarWidth": 0,
	
			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sX": null,
	
			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @deprecated
			 */
			"sXInner": null,
	
			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sY": null
		},
	
		/**
		 * Language information for the table.
		 *  @namespace
		 *  @extends DataTable.defaults.oLanguage
		 */
		"oLanguage": {
			/**
			 * Information callback function. See
			 * {@link DataTable.defaults.fnInfoCallback}
			 *  @type function
			 *  @default null
			 */
			"fnInfoCallback": null
		},
	
		/**
		 * Browser support parameters
		 *  @namespace
		 */
		"oBrowser": {
			/**
			 * Indicate if the browser incorrectly calculates width:100% inside a
			 * scrolling element (IE6/7)
			 *  @type boolean
			 *  @default false
			 */
			"bScrollOversize": false,
	
			/**
			 * Determine if the vertical scrollbar is on the right or left of the
			 * scrolling container - needed for rtl language layout, although not
			 * all browsers move the scrollbar (Safari).
			 *  @type boolean
			 *  @default false
			 */
			"bScrollbarLeft": false,
	
			/**
			 * Flag for if `getBoundingClientRect` is fully supported or not
			 *  @type boolean
			 *  @default false
			 */
			"bBounding": false,
	
			/**
			 * Browser scrollbar width
			 *  @type integer
			 *  @default 0
			 */
			"barWidth": 0
		},
	
	
		"ajax": null,
	
	
		/**
		 * Array referencing the nodes which are used for the features. The
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aanFeatures": [],
	
		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 *  @type array
		 *  @default []
		 */
		"aoData": [],
	
		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 *  @type array
		 *  @default []
		 */
		"aiDisplay": [],
	
		/**
		 * Array of indexes for display - no filtering
		 *  @type array
		 *  @default []
		 */
		"aiDisplayMaster": [],
	
		/**
		 * Map of row ids to data indexes
		 *  @type object
		 *  @default {}
		 */
		"aIds": {},
	
		/**
		 * Store information about each column that is in use
		 *  @type array
		 *  @default []
		 */
		"aoColumns": [],
	
		/**
		 * Store information about the table's header
		 *  @type array
		 *  @default []
		 */
		"aoHeader": [],
	
		/**
		 * Store information about the table's footer
		 *  @type array
		 *  @default []
		 */
		"aoFooter": [],
	
		/**
		 * Store the applied global search information in case we want to force a
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @namespace
		 *  @extends DataTable.models.oSearch
		 */
		"oPreviousSearch": {},
	
		/**
		 * Store the applied search for each column - see
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 *  @type array
		 *  @default []
		 */
		"aoPreSearchCols": [],
	
		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @todo These inner arrays should really be objects
		 */
		"aaSorting": null,
	
		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"aaSortingFixed": [],
	
		/**
		 * Classes to use for the striping of a table.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"asStripeClasses": null,
	
		/**
		 * If restoring a table - we should restore its striping classes as well
		 *  @type array
		 *  @default []
		 */
		"asDestroyStripes": [],
	
		/**
		 * If restoring a table - we should restore its width
		 *  @type int
		 *  @default 0
		 */
		"sDestroyWidth": 0,
	
		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 *  @type array
		 *  @default []
		 */
		"aoRowCallback": [],
	
		/**
		 * Callback functions for the header on each draw.
		 *  @type array
		 *  @default []
		 */
		"aoHeaderCallback": [],
	
		/**
		 * Callback function for the footer on each draw.
		 *  @type array
		 *  @default []
		 */
		"aoFooterCallback": [],
	
		/**
		 * Array of callback functions for draw callback functions
		 *  @type array
		 *  @default []
		 */
		"aoDrawCallback": [],
	
		/**
		 * Array of callback functions for row created function
		 *  @type array
		 *  @default []
		 */
		"aoRowCreatedCallback": [],
	
		/**
		 * Callback functions for just before the table is redrawn. A return of
		 * false will be used to cancel the draw.
		 *  @type array
		 *  @default []
		 */
		"aoPreDrawCallback": [],
	
		/**
		 * Callback functions for when the table has been initialised.
		 *  @type array
		 *  @default []
		 */
		"aoInitComplete": [],
	
	
		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 *  @type array
		 *  @default []
		 */
		"aoStateSaveParams": [],
	
		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 *  @type array
		 *  @default []
		 */
		"aoStateLoadParams": [],
	
		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 *  @type array
		 *  @default []
		 */
		"aoStateLoaded": [],
	
		/**
		 * Cache the table ID for quick access
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sTableId": "",
	
		/**
		 * The TABLE node for the main table
		 *  @type node
		 *  @default null
		 */
		"nTable": null,
	
		/**
		 * Permanent ref to the thead element
		 *  @type node
		 *  @default null
		 */
		"nTHead": null,
	
		/**
		 * Permanent ref to the tfoot element - if it exists
		 *  @type node
		 *  @default null
		 */
		"nTFoot": null,
	
		/**
		 * Permanent ref to the tbody element
		 *  @type node
		 *  @default null
		 */
		"nTBody": null,
	
		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 *  @type node
		 *  @default null
		 */
		"nTableWrapper": null,
	
		/**
		 * Indicate if when using server-side processing the loading of data
		 * should be deferred until the second draw.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 *  @default false
		 */
		"bDeferLoading": false,
	
		/**
		 * Indicate if all required information has been read in
		 *  @type boolean
		 *  @default false
		 */
		"bInitialised": false,
	
		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 *  @type array
		 *  @default []
		 */
		"aoOpenRows": [],
	
		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default null
		 */
		"sDom": null,
	
		/**
		 * Search delay (in mS)
		 *  @type integer
		 *  @default null
		 */
		"searchDelay": null,
	
		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default two_button
		 */
		"sPaginationType": "two_button",
	
		/**
		 * The state duration (for `stateSave`) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type int
		 *  @default 0
		 */
		"iStateDuration": 0,
	
		/**
		 * Array of callback functions for state saving. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aoStateSave": [],
	
		/**
		 * Array of callback functions for state loading. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aoStateLoad": [],
	
		/**
		 * State that was saved. Useful for back reference
		 *  @type object
		 *  @default null
		 */
		"oSavedState": null,
	
		/**
		 * State that was loaded. Useful for back reference
		 *  @type object
		 *  @default null
		 */
		"oLoadedState": null,
	
		/**
		 * Source url for AJAX data for the table.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default null
		 */
		"sAjaxSource": null,
	
		/**
		 * Property from a given object from which to read the table data from. This
		 * can be an empty string (when not server-side processing), in which case
		 * it is  assumed an an array is given directly.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 */
		"sAjaxDataProp": null,
	
		/**
		 * The last jQuery XHR object that was used for server-side data gathering.
		 * This can be used for working with the XHR information in one of the
		 * callbacks
		 *  @type object
		 *  @default null
		 */
		"jqXHR": null,
	
		/**
		 * JSON returned from the server in the last Ajax request
		 *  @type object
		 *  @default undefined
		 */
		"json": undefined,
	
		/**
		 * Data submitted as part of the last Ajax request
		 *  @type object
		 *  @default undefined
		 */
		"oAjaxData": undefined,
	
		/**
		 * Function to get the server-side data.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 */
		"fnServerData": null,
	
		/**
		 * Functions which are called prior to sending an Ajax request so extra
		 * parameters can easily be sent to the server
		 *  @type array
		 *  @default []
		 */
		"aoServerParams": [],
	
		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 */
		"sServerMethod": null,
	
		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 */
		"fnFormatNumber": null,
	
		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"aLengthMenu": null,
	
		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 *  @type int
		 *  @default 0
		 */
		"iDraw": 0,
	
		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 *  @type boolean
		 *  @default false
		 */
		"bDrawing": false,
	
		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 *  @type int
		 *  @default -1
		 */
		"iDrawError": -1,
	
		/**
		 * Paging display length
		 *  @type int
		 *  @default 10
		 */
		"_iDisplayLength": 10,
	
		/**
		 * Paging start point - aiDisplay index
		 *  @type int
		 *  @default 0
		 */
		"_iDisplayStart": 0,
	
		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 *  @type int
		 *  @default 0
		 *  @private
		 */
		"_iRecordsTotal": 0,
	
		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 *  @type boolean
		 *  @default 0
		 *  @private
		 */
		"_iRecordsDisplay": 0,
	
		/**
		 * The classes to use for the table
		 *  @type object
		 *  @default {}
		 */
		"oClasses": {},
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @type boolean
		 *  @default false
		 *  @deprecated
		 */
		"bFiltered": false,
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @type boolean
		 *  @default false
		 *  @deprecated
		 */
		"bSorted": false,
	
		/**
		 * Indicate that if multiple rows are in the header and there is more than
		 * one unique cell per column, if the top one (true) or bottom one (false)
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 */
		"bSortCellsTop": null,
	
		/**
		 * Initialisation object that is used for the table
		 *  @type object
		 *  @default null
		 */
		"oInit": null,
	
		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 *  @type array
		 *  @default []
		 */
		"aoDestroyCallback": [],
	
	
		/**
		 * Get the number of records in the current record set, before filtering
		 *  @type function
		 */
		"fnRecordsTotal": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsTotal * 1 :
				this.aiDisplayMaster.length;
		},
	
		/**
		 * Get the number of records in the current record set, after filtering
		 *  @type function
		 */
		"fnRecordsDisplay": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsDisplay * 1 :
				this.aiDisplay.length;
		},
	
		/**
		 * Get the display end point - aiDisplay index
		 *  @type function
		 */
		"fnDisplayEnd": function ()
		{
			var
				len      = this._iDisplayLength,
				start    = this._iDisplayStart,
				calc     = start + len,
				records  = this.aiDisplay.length,
				features = this.oFeatures,
				paginate = features.bPaginate;
	
			if ( features.bServerSide ) {
				return paginate === false || len === -1 ?
					start + records :
					Math.min( start+len, this._iRecordsDisplay );
			}
			else {
				return ! paginate || calc>records || len===-1 ?
					records :
					calc;
			}
		},
	
		/**
		 * The DataTables object for this table
		 *  @type object
		 *  @default null
		 */
		"oInstance": null,
	
		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 *  @type string
		 *  @default null
		 */
		"sInstance": null,
	
		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollHead": null,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollFoot": null,
	
		/**
		 * Last applied sort
		 *  @type array
		 *  @default []
		 */
		"aLastSort": [],
	
		/**
		 * Stored plug-in instances
		 *  @type object
		 *  @default {}
		 */
		"oPlugins": {},
	
		/**
		 * Function used to get a row's id from the row's data
		 *  @type function
		 *  @default null
		 */
		"rowIdFn": null,
	
		/**
		 * Data location where to store a row's id
		 *  @type string
		 *  @default null
		 */
		"rowId": null
	};

	/**
	 * Extension object for DataTables that is used to provide all extension
	 * options.
	 *
	 * Note that the `DataTable.ext` object is available through
	 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
	 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */
	
	
	/**
	 * DataTables extensions
	 * 
	 * This namespace acts as a collection area for plug-ins that can be used to
	 * extend DataTables capabilities. Indeed many of the build in methods
	 * use this method to provide their own capabilities (sorting methods for
	 * example).
	 *
	 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
	 * reasons
	 *
	 *  @namespace
	 */
	DataTable.ext = _ext = {
		/**
		 * Buttons. For use with the Buttons extension for DataTables. This is
		 * defined here so other extensions can define buttons regardless of load
		 * order. It is _not_ used by DataTables core.
		 *
		 *  @type object
		 *  @default {}
		 */
		buttons: {},
	
	
		/**
		 * Element class names
		 *
		 *  @type object
		 *  @default {}
		 */
		classes: {},
	
	
		/**
		 * DataTables build type (expanded by the download builder)
		 *
		 *  @type string
		 */
		builder: "-source-",
	
	
		/**
		 * Error reporting.
		 * 
		 * How should DataTables report an error. Can take the value 'alert',
		 * 'throw', 'none' or a function.
		 *
		 *  @type string|function
		 *  @default alert
		 */
		errMode: "alert",
	
	
		/**
		 * Feature plug-ins.
		 * 
		 * This is an array of objects which describe the feature plug-ins that are
		 * available to DataTables. These feature plug-ins are then available for
		 * use through the `dom` initialisation option.
		 * 
		 * Each feature plug-in is described by an object which must have the
		 * following properties:
		 * 
		 * * `fnInit` - function that is used to initialise the plug-in,
		 * * `cFeature` - a character so the feature can be enabled by the `dom`
		 *   instillation option. This is case sensitive.
		 *
		 * The `fnInit` function has the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 *
		 * And the following return is expected:
		 * 
		 * * {node|null} The element which contains your feature. Note that the
		 *   return may also be void if your plug-in does not require to inject any
		 *   DOM elements into DataTables control (`dom`) - for example this might
		 *   be useful when developing a plug-in which allows table control via
		 *   keyboard entry
		 *
		 *  @type array
		 *
		 *  @example
		 *    $.fn.dataTable.ext.features.push( {
		 *      "fnInit": function( oSettings ) {
		 *        return new TableTools( { "oDTSettings": oSettings } );
		 *      },
		 *      "cFeature": "T"
		 *    } );
		 */
		feature: [],
	
	
		/**
		 * Row searching.
		 * 
		 * This method of searching is complimentary to the default type based
		 * searching, and a lot more comprehensive as it allows you complete control
		 * over the searching logic. Each element in this array is a function
		 * (parameters described below) that is called for every row in the table,
		 * and your logic decides if it should be included in the searching data set
		 * or not.
		 *
		 * Searching functions have the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{array|object}` Data for the row to be processed (same as the
		 *    original format that was passed in as the data source, or an array
		 *    from a DOM data source
		 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
		 *    can be useful to retrieve the `TR` element if you need DOM interaction.
		 *
		 * And the following return is expected:
		 *
		 * * {boolean} Include the row in the searched result set (true) or not
		 *   (false)
		 *
		 * Note that as with the main search ability in DataTables, technically this
		 * is "filtering", since it is subtractive. However, for consistency in
		 * naming we call it searching here.
		 *
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom search being applied to the
		 *    // fourth column (i.e. the data[3] index) based on two input values
		 *    // from the end-user, matching the data in a certain range.
		 *    $.fn.dataTable.ext.search.push(
		 *      function( settings, data, dataIndex ) {
		 *        var min = document.getElementById('min').value * 1;
		 *        var max = document.getElementById('max').value * 1;
		 *        var version = data[3] == "-" ? 0 : data[3]*1;
		 *
		 *        if ( min == "" && max == "" ) {
		 *          return true;
		 *        }
		 *        else if ( min == "" && version < max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && "" == max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && version < max ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		search: [],
	
	
		/**
		 * Selector extensions
		 *
		 * The `selector` option can be used to extend the options available for the
		 * selector modifier options (`selector-modifier` object data type) that
		 * each of the three built in selector types offer (row, column and cell +
		 * their plural counterparts). For example the Select extension uses this
		 * mechanism to provide an option to select only rows, columns and cells
		 * that have been marked as selected by the end user (`{selected: true}`),
		 * which can be used in conjunction with the existing built in selector
		 * options.
		 *
		 * Each property is an array to which functions can be pushed. The functions
		 * take three attributes:
		 *
		 * * Settings object for the host table
		 * * Options object (`selector-modifier` object type)
		 * * Array of selected item indexes
		 *
		 * The return is an array of the resulting item indexes after the custom
		 * selector has been applied.
		 *
		 *  @type object
		 */
		selector: {
			cell: [],
			column: [],
			row: []
		},
	
	
		/**
		 * Internal functions, exposed for used in plug-ins.
		 * 
		 * Please note that you should not need to use the internal methods for
		 * anything other than a plug-in (and even then, try to avoid if possible).
		 * The internal function may change between releases.
		 *
		 *  @type object
		 *  @default {}
		 */
		internal: {},
	
	
		/**
		 * Legacy configuration options. Enable and disable legacy options that
		 * are available in DataTables.
		 *
		 *  @type object
		 */
		legacy: {
			/**
			 * Enable / disable DataTables 1.9 compatible server-side processing
			 * requests
			 *
			 *  @type boolean
			 *  @default null
			 */
			ajax: null
		},
	
	
		/**
		 * Pagination plug-in methods.
		 * 
		 * Each entry in this object is a function and defines which buttons should
		 * be shown by the pagination rendering method that is used for the table:
		 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
		 * buttons are displayed in the document, while the functions here tell it
		 * what buttons to display. This is done by returning an array of button
		 * descriptions (what each button will do).
		 *
		 * Pagination types (the four built in options and any additional plug-in
		 * options defined here) can be used through the `paginationType`
		 * initialisation parameter.
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{int} page` The current page index
		 * 2. `{int} pages` The number of pages in the table
		 *
		 * Each function is expected to return an array where each element of the
		 * array can be one of:
		 *
		 * * `first` - Jump to first page when activated
		 * * `last` - Jump to last page when activated
		 * * `previous` - Show previous page when activated
		 * * `next` - Show next page when activated
		 * * `{int}` - Show page of the index given
		 * * `{array}` - A nested array containing the above elements to add a
		 *   containing 'DIV' element (might be useful for styling).
		 *
		 * Note that DataTables v1.9- used this object slightly differently whereby
		 * an object with two functions would be defined for each plug-in. That
		 * ability is still supported by DataTables 1.10+ to provide backwards
		 * compatibility, but this option of use is now decremented and no longer
		 * documented in DataTables 1.10+.
		 *
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Show previous, next and current page buttons only
		 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
		 *      return [ 'previous', page, 'next' ];
		 *    };
		 */
		pager: {},
	
	
		renderer: {
			pageButton: {},
			header: {}
		},
	
	
		/**
		 * Ordering plug-ins - custom data source
		 * 
		 * The extension options for ordering of data available here is complimentary
		 * to the default type based ordering that DataTables typically uses. It
		 * allows much greater control over the the data that is being used to
		 * order a column, but is necessarily therefore more complex.
		 * 
		 * This type of ordering is useful if you want to do ordering based on data
		 * live from the DOM (for example the contents of an 'input' element) rather
		 * than just the static string that DataTables knows of.
		 * 
		 * The way these plug-ins work is that you create an array of the values you
		 * wish to be ordering for the column in question and then return that
		 * array. The data in the array much be in the index order of the rows in
		 * the table (not the currently ordering order!). Which order data gathering
		 * function is run here depends on the `dt-init columns.orderDataType`
		 * parameter that is used for the column (if any).
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{int}` Target column index
		 *
		 * Each function is expected to return an array:
		 *
		 * * `{array}` Data for the column to be ordering upon
		 *
		 *  @type array
		 *
		 *  @example
		 *    // Ordering using `input` node values
		 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
		 *    {
		 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		 *        return $('input', td).val();
		 *      } );
		 *    }
		 */
		order: {},
	
	
		/**
		 * Type based plug-ins.
		 *
		 * Each column in DataTables has a type assigned to it, either by automatic
		 * detection or by direct assignment using the `type` option for the column.
		 * The type of a column will effect how it is ordering and search (plug-ins
		 * can also make use of the column type if required).
		 *
		 * @namespace
		 */
		type: {
			/**
			 * Type detection functions.
			 *
			 * The functions defined in this object are used to automatically detect
			 * a column's type, making initialisation of DataTables super easy, even
			 * when complex data is in the table.
			 *
			 * The functions defined take two parameters:
			 *
		     *  1. `{*}` Data from the column cell to be analysed
		     *  2. `{settings}` DataTables settings object. This can be used to
		     *     perform context specific type detection - for example detection
		     *     based on language settings such as using a comma for a decimal
		     *     place. Generally speaking the options from the settings will not
		     *     be required
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Data type detected, or null if unknown (and thus
			 *   pass it on to the other type detection functions.
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Currency type detection plug-in:
			 *    $.fn.dataTable.ext.type.detect.push(
			 *      function ( data, settings ) {
			 *        // Check the numeric part
			 *        if ( ! data.substring(1).match(/[0-9]/) ) {
			 *          return null;
			 *        }
			 *
			 *        // Check prefixed by currency
			 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
			 *          return 'currency';
			 *        }
			 *        return null;
			 *      }
			 *    );
			 */
			detect: [],
	
	
			/**
			 * Type based search formatting.
			 *
			 * The type based searching functions can be used to pre-format the
			 * data to be search on. For example, it can be used to strip HTML
			 * tags or to de-format telephone numbers for numeric only searching.
			 *
			 * Note that is a search is not defined for a column of a given type,
			 * no search formatting will be performed.
			 * 
			 * Pre-processing of searching data plug-ins - When you assign the sType
			 * for a column (or have it automatically detected for you by DataTables
			 * or a type detection plug-in), you will typically be using this for
			 * custom sorting, but it can also be used to provide custom searching
			 * by allowing you to pre-processing the data and returning the data in
			 * the format that should be searched upon. This is done by adding
			 * functions this object with a parameter name which matches the sType
			 * for that target column. This is the corollary of <i>afnSortData</i>
			 * for searching data.
			 *
			 * The functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for searching
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Formatted string that will be used for the searching.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
			 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
			 *    }
			 */
			search: {},
	
	
			/**
			 * Type based ordering.
			 *
			 * The column type tells DataTables what ordering to apply to the table
			 * when a column is sorted upon. The order for each type that is defined,
			 * is defined by the functions available in this object.
			 *
			 * Each ordering option can be described by three properties added to
			 * this object:
			 *
			 * * `{type}-pre` - Pre-formatting function
			 * * `{type}-asc` - Ascending order function
			 * * `{type}-desc` - Descending order function
			 *
			 * All three can be used together, only `{type}-pre` or only
			 * `{type}-asc` and `{type}-desc` together. It is generally recommended
			 * that only `{type}-pre` is used, as this provides the optimal
			 * implementation in terms of speed, although the others are provided
			 * for compatibility with existing Javascript sort functions.
			 *
			 * `{type}-pre`: Functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for ordering
			 *
			 * And return:
			 *
			 * * `{*}` Data to be sorted upon
			 *
			 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
			 * functions, taking two parameters:
			 *
		     *  1. `{*}` Data to compare to the second parameter
		     *  2. `{*}` Data to compare to the first parameter
			 *
			 * And returning:
			 *
			 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
			 *   than the second parameter, ===0 if the two parameters are equal and
			 *   >0 if the first parameter should be sorted height than the second
			 *   parameter.
			 * 
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Numeric ordering of formatted numbers with a pre-formatter
			 *    $.extend( $.fn.dataTable.ext.type.order, {
			 *      "string-pre": function(x) {
			 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
			 *        return parseFloat( a );
			 *      }
			 *    } );
			 *
			 *  @example
			 *    // Case-sensitive string ordering, with no pre-formatting method
			 *    $.extend( $.fn.dataTable.ext.order, {
			 *      "string-case-asc": function(x,y) {
			 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			 *      },
			 *      "string-case-desc": function(x,y) {
			 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			 *      }
			 *    } );
			 */
			order: {}
		},
	
		/**
		 * Unique DataTables instance counter
		 *
		 * @type int
		 * @private
		 */
		_unique: 0,
	
	
		//
		// Depreciated
		// The following properties are retained for backwards compatiblity only.
		// The should not be used in new projects and will be removed in a future
		// version
		//
	
		/**
		 * Version check function.
		 *  @type function
		 *  @depreciated Since 1.10
		 */
		fnVersionCheck: DataTable.fnVersionCheck,
	
	
		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @deprecated Since v1.10
		 */
		iApiIndex: 0,
	
	
		/**
		 * jQuery UI class container
		 *  @type object
		 *  @deprecated Since v1.10
		 */
		oJUIClasses: {},
	
	
		/**
		 * Software version
		 *  @type string
		 *  @deprecated Since v1.10
		 */
		sVersion: DataTable.version
	};
	
	
	//
	// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
	//
	$.extend( _ext, {
		afnFiltering: _ext.search,
		aTypes:       _ext.type.detect,
		ofnSearch:    _ext.type.search,
		oSort:        _ext.type.order,
		afnSortData:  _ext.order,
		aoFeatures:   _ext.feature,
		oApi:         _ext.internal,
		oStdClasses:  _ext.classes,
		oPagination:  _ext.pager
	} );
	
	
	$.extend( DataTable.ext.classes, {
		"sTable": "dataTable",
		"sNoFooter": "no-footer",
	
		/* Paging buttons */
		"sPageButton": "paginate_button",
		"sPageButtonActive": "current",
		"sPageButtonDisabled": "disabled",
	
		/* Striping classes */
		"sStripeOdd": "odd",
		"sStripeEven": "even",
	
		/* Empty row */
		"sRowEmpty": "dataTables_empty",
	
		/* Features */
		"sWrapper": "dataTables_wrapper",
		"sFilter": "dataTables_filter",
		"sInfo": "dataTables_info",
		"sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
		"sLength": "dataTables_length",
		"sProcessing": "dataTables_processing",
	
		/* Sorting */
		"sSortAsc": "sorting_asc",
		"sSortDesc": "sorting_desc",
		"sSortable": "sorting", /* Sortable in both directions */
		"sSortableAsc": "sorting_desc_disabled",
		"sSortableDesc": "sorting_asc_disabled",
		"sSortableNone": "sorting_disabled",
		"sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */
	
		/* Filtering */
		"sFilterInput": "",
	
		/* Page length */
		"sLengthSelect": "",
	
		/* Scrolling */
		"sScrollWrapper": "dataTables_scroll",
		"sScrollHead": "dataTables_scrollHead",
		"sScrollHeadInner": "dataTables_scrollHeadInner",
		"sScrollBody": "dataTables_scrollBody",
		"sScrollFoot": "dataTables_scrollFoot",
		"sScrollFootInner": "dataTables_scrollFootInner",
	
		/* Misc */
		"sHeaderTH": "",
		"sFooterTH": "",
	
		// Deprecated
		"sSortJUIAsc": "",
		"sSortJUIDesc": "",
		"sSortJUI": "",
		"sSortJUIAscAllowed": "",
		"sSortJUIDescAllowed": "",
		"sSortJUIWrapper": "",
		"sSortIcon": "",
		"sJUIHeader": "",
		"sJUIFooter": ""
	} );
	
	
	var extPagination = DataTable.ext.pager;
	
	function _numbers ( page, pages ) {
		var
			numbers = [],
			buttons = extPagination.numbers_length,
			half = Math.floor( buttons / 2 ),
			i = 1;
	
		if ( pages <= buttons ) {
			numbers = _range( 0, pages );
		}
		else if ( page <= half ) {
			numbers = _range( 0, buttons-2 );
			numbers.push( 'ellipsis' );
			numbers.push( pages-1 );
		}
		else if ( page >= pages - 1 - half ) {
			numbers = _range( pages-(buttons-2), pages );
			numbers.splice( 0, 0, 'ellipsis' ); // no unshift in ie6
			numbers.splice( 0, 0, 0 );
		}
		else {
			numbers = _range( page-half+2, page+half-1 );
			numbers.push( 'ellipsis' );
			numbers.push( pages-1 );
			numbers.splice( 0, 0, 'ellipsis' );
			numbers.splice( 0, 0, 0 );
		}
	
		numbers.DT_el = 'span';
		return numbers;
	}
	
	
	$.extend( extPagination, {
		simple: function ( page, pages ) {
			return [ 'previous', 'next' ];
		},
	
		full: function ( page, pages ) {
			return [  'first', 'previous', 'next', 'last' ];
		},
	
		numbers: function ( page, pages ) {
			return [ _numbers(page, pages) ];
		},
	
		simple_numbers: function ( page, pages ) {
			return [ 'previous', _numbers(page, pages), 'next' ];
		},
	
		full_numbers: function ( page, pages ) {
			return [ 'first', 'previous', _numbers(page, pages), 'next', 'last' ];
		},
		
		first_last_numbers: function (page, pages) {
	 		return ['first', _numbers(page, pages), 'last'];
	 	},
	
		// For testing and plug-ins to use
		_numbers: _numbers,
	
		// Number of number buttons (including ellipsis) to show. _Must be odd!_
		numbers_length: 7
	} );
	
	
	$.extend( true, DataTable.ext.renderer, {
		pageButton: {
			_: function ( settings, host, idx, buttons, page, pages ) {
				var classes = settings.oClasses;
				var lang = settings.oLanguage.oPaginate;
				var aria = settings.oLanguage.oAria.paginate || {};
				var btnDisplay, btnClass, counter=0;
	
				var attach = function( container, buttons ) {
					var i, ien, node, button, tabIndex;
					var disabledClass = classes.sPageButtonDisabled;
					var clickHandler = function ( e ) {
						_fnPageChange( settings, e.data.action, true );
					};
	
					for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
						button = buttons[i];
	
						if ( Array.isArray( button ) ) {
							var inner = $( '<'+(button.DT_el || 'div')+'/>' )
								.appendTo( container );
							attach( inner, button );
						}
						else {
							btnDisplay = null;
							btnClass = button;
							tabIndex = settings.iTabIndex;
	
							switch ( button ) {
								case 'ellipsis':
									container.append('<span class="ellipsis">&#x2026;</span>');
									break;
	
								case 'first':
									btnDisplay = lang.sFirst;
	
									if ( page === 0 ) {
										tabIndex = -1;
										btnClass += ' ' + disabledClass;
									}
									break;
	
								case 'previous':
									btnDisplay = lang.sPrevious;
	
									if ( page === 0 ) {
										tabIndex = -1;
										btnClass += ' ' + disabledClass;
									}
									break;
	
								case 'next':
									btnDisplay = lang.sNext;
	
									if ( pages === 0 || page === pages-1 ) {
										tabIndex = -1;
										btnClass += ' ' + disabledClass;
									}
									break;
	
								case 'last':
									btnDisplay = lang.sLast;
	
									if ( pages === 0 || page === pages-1 ) {
										tabIndex = -1;
										btnClass += ' ' + disabledClass;
									}
									break;
	
								default:
									btnDisplay = settings.fnFormatNumber( button + 1 );
									btnClass = page === button ?
										classes.sPageButtonActive : '';
									break;
							}
	
							if ( btnDisplay !== null ) {
								node = $('<a>', {
										'class': classes.sPageButton+' '+btnClass,
										'aria-controls': settings.sTableId,
										'aria-label': aria[ button ],
										'data-dt-idx': counter,
										'tabindex': tabIndex,
										'id': idx === 0 && typeof button === 'string' ?
											settings.sTableId +'_'+ button :
											null
									} )
									.html( btnDisplay )
									.appendTo( container );
	
								_fnBindAction(
									node, {action: button}, clickHandler
								);
	
								counter++;
							}
						}
					}
				};
	
				// IE9 throws an 'unknown error' if document.activeElement is used
				// inside an iframe or frame. Try / catch the error. Not good for
				// accessibility, but neither are frames.
				var activeEl;
	
				try {
					// Because this approach is destroying and recreating the paging
					// elements, focus is lost on the select button which is bad for
					// accessibility. So we want to restore focus once the draw has
					// completed
					activeEl = $(host).find(document.activeElement).data('dt-idx');
				}
				catch (e) {}
	
				attach( $(host).empty(), buttons );
	
				if ( activeEl !== undefined ) {
					$(host).find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
				}
			}
		}
	} );
	
	
	
	// Built in type detection. See model.ext.aTypes for information about
	// what is required from this methods.
	$.extend( DataTable.ext.type.detect, [
		// Plain numbers - first since V8 detects some plain numbers as dates
		// e.g. Date.parse('55') (but not all, e.g. Date.parse('22')...).
		function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _isNumber( d, decimal ) ? 'num'+decimal : null;
		},
	
		// Dates (only those recognised by the browser's Date.parse)
		function ( d, settings )
		{
			// V8 tries _very_ hard to make a string passed into `Date.parse()`
			// valid, so we need to use a regex to restrict date formats. Use a
			// plug-in for anything other than ISO8601 style strings
			if ( d && !(d instanceof Date) && ! _re_date.test(d) ) {
				return null;
			}
			var parsed = Date.parse(d);
			return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
		},
	
		// Formatted numbers
		function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _isNumber( d, decimal, true ) ? 'num-fmt'+decimal : null;
		},
	
		// HTML numeric
		function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _htmlNumeric( d, decimal ) ? 'html-num'+decimal : null;
		},
	
		// HTML numeric, formatted
		function ( d, settings )
		{
			var decimal = settings.oLanguage.sDecimal;
			return _htmlNumeric( d, decimal, true ) ? 'html-num-fmt'+decimal : null;
		},
	
		// HTML (this is strict checking - there must be html)
		function ( d, settings )
		{
			return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1) ?
				'html' : null;
		}
	] );
	
	
	
	// Filter formatting functions. See model.ext.ofnSearch for information about
	// what is required from these methods.
	// 
	// Note that additional search methods are added for the html numbers and
	// html formatted numbers by `_addNumericSort()` when we know what the decimal
	// place is
	
	
	$.extend( DataTable.ext.type.search, {
		html: function ( data ) {
			return _empty(data) ?
				data :
				typeof data === 'string' ?
					data
						.replace( _re_new_lines, " " )
						.replace( _re_html, "" ) :
					'';
		},
	
		string: function ( data ) {
			return _empty(data) ?
				data :
				typeof data === 'string' ?
					data.replace( _re_new_lines, " " ) :
					data;
		}
	} );
	
	
	
	var __numericReplace = function ( d, decimalPlace, re1, re2 ) {
		if ( d !== 0 && (!d || d === '-') ) {
			return -Infinity;
		}
	
		// If a decimal place other than `.` is used, it needs to be given to the
		// function so we can detect it and replace with a `.` which is the only
		// decimal place Javascript recognises - it is not locale aware.
		if ( decimalPlace ) {
			d = _numToDecimal( d, decimalPlace );
		}
	
		if ( d.replace ) {
			if ( re1 ) {
				d = d.replace( re1, '' );
			}
	
			if ( re2 ) {
				d = d.replace( re2, '' );
			}
		}
	
		return d * 1;
	};
	
	
	// Add the numeric 'deformatting' functions for sorting and search. This is done
	// in a function to provide an easy ability for the language options to add
	// additional methods if a non-period decimal place is used.
	function _addNumericSort ( decimalPlace ) {
		$.each(
			{
				// Plain numbers
				"num": function ( d ) {
					return __numericReplace( d, decimalPlace );
				},
	
				// Formatted numbers
				"num-fmt": function ( d ) {
					return __numericReplace( d, decimalPlace, _re_formatted_numeric );
				},
	
				// HTML numeric
				"html-num": function ( d ) {
					return __numericReplace( d, decimalPlace, _re_html );
				},
	
				// HTML numeric, formatted
				"html-num-fmt": function ( d ) {
					return __numericReplace( d, decimalPlace, _re_html, _re_formatted_numeric );
				}
			},
			function ( key, fn ) {
				// Add the ordering method
				_ext.type.order[ key+decimalPlace+'-pre' ] = fn;
	
				// For HTML types add a search formatter that will strip the HTML
				if ( key.match(/^html\-/) ) {
					_ext.type.search[ key+decimalPlace ] = _ext.type.search.html;
				}
			}
		);
	}
	
	
	// Default sort methods
	$.extend( _ext.type.order, {
		// Dates
		"date-pre": function ( d ) {
			var ts = Date.parse( d );
			return isNaN(ts) ? -Infinity : ts;
		},
	
		// html
		"html-pre": function ( a ) {
			return _empty(a) ?
				'' :
				a.replace ?
					a.replace( /<.*?>/g, "" ).toLowerCase() :
					a+'';
		},
	
		// string
		"string-pre": function ( a ) {
			// This is a little complex, but faster than always calling toString,
			// http://jsperf.com/tostring-v-check
			return _empty(a) ?
				'' :
				typeof a === 'string' ?
					a.toLowerCase() :
					! a.toString ?
						'' :
						a.toString();
		},
	
		// string-asc and -desc are retained only for compatibility with the old
		// sort methods
		"string-asc": function ( x, y ) {
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
	
		"string-desc": function ( x, y ) {
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		}
	} );
	
	
	// Numeric sorting types - order doesn't matter here
	_addNumericSort( '' );
	
	
	$.extend( true, DataTable.ext.renderer, {
		header: {
			_: function ( settings, cell, column, classes ) {
				// No additional mark-up required
				// Attach a sort listener to update on sort - note that using the
				// `DT` namespace will allow the event to be removed automatically
				// on destroy, while the `dt` namespaced event is the one we are
				// listening for
				$(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting, columns ) {
					if ( settings !== ctx ) { // need to check this this is the host
						return;               // table, not a nested one
					}
	
					var colIdx = column.idx;
	
					cell
						.removeClass(
							classes.sSortAsc +' '+
							classes.sSortDesc
						)
						.addClass( columns[ colIdx ] == 'asc' ?
							classes.sSortAsc : columns[ colIdx ] == 'desc' ?
								classes.sSortDesc :
								column.sSortingClass
						);
				} );
			},
	
			jqueryui: function ( settings, cell, column, classes ) {
				$('<div/>')
					.addClass( classes.sSortJUIWrapper )
					.append( cell.contents() )
					.append( $('<span/>')
						.addClass( classes.sSortIcon+' '+column.sSortingClassJUI )
					)
					.appendTo( cell );
	
				// Attach a sort listener to update on sort
				$(settings.nTable).on( 'order.dt.DT', function ( e, ctx, sorting, columns ) {
					if ( settings !== ctx ) {
						return;
					}
	
					var colIdx = column.idx;
	
					cell
						.removeClass( classes.sSortAsc +" "+classes.sSortDesc )
						.addClass( columns[ colIdx ] == 'asc' ?
							classes.sSortAsc : columns[ colIdx ] == 'desc' ?
								classes.sSortDesc :
								column.sSortingClass
						);
	
					cell
						.find( 'span.'+classes.sSortIcon )
						.removeClass(
							classes.sSortJUIAsc +" "+
							classes.sSortJUIDesc +" "+
							classes.sSortJUI +" "+
							classes.sSortJUIAscAllowed +" "+
							classes.sSortJUIDescAllowed
						)
						.addClass( columns[ colIdx ] == 'asc' ?
							classes.sSortJUIAsc : columns[ colIdx ] == 'desc' ?
								classes.sSortJUIDesc :
								column.sSortingClassJUI
						);
				} );
			}
		}
	} );
	
	/*
	 * Public helper functions. These aren't used internally by DataTables, or
	 * called by any of the options passed into DataTables, but they can be used
	 * externally by developers working with DataTables. They are helper functions
	 * to make working with DataTables a little bit easier.
	 */
	
	var __htmlEscapeEntities = function ( d ) {
		return typeof d === 'string' ?
			d
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;') :
			d;
	};
	
	/**
	 * Helpers for `columns.render`.
	 *
	 * The options defined here can be used with the `columns.render` initialisation
	 * option to provide a display renderer. The following functions are defined:
	 *
	 * * `number` - Will format numeric data (defined by `columns.data`) for
	 *   display, retaining the original unformatted data for sorting and filtering.
	 *   It takes 5 parameters:
	 *   * `string` - Thousands grouping separator
	 *   * `string` - Decimal point indicator
	 *   * `integer` - Number of decimal points to show
	 *   * `string` (optional) - Prefix.
	 *   * `string` (optional) - Postfix (/suffix).
	 * * `text` - Escape HTML to help prevent XSS attacks. It has no optional
	 *   parameters.
	 *
	 * @example
	 *   // Column definition using the number renderer
	 *   {
	 *     data: "salary",
	 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
	 *   }
	 *
	 * @namespace
	 */
	DataTable.render = {
		number: function ( thousands, decimal, precision, prefix, postfix ) {
			return {
				display: function ( d ) {
					if ( typeof d !== 'number' && typeof d !== 'string' ) {
						return d;
					}
	
					var negative = d < 0 ? '-' : '';
					var flo = parseFloat( d );
	
					// If NaN then there isn't much formatting that we can do - just
					// return immediately, escaping any HTML (this was supposed to
					// be a number after all)
					if ( isNaN( flo ) ) {
						return __htmlEscapeEntities( d );
					}
	
					flo = flo.toFixed( precision );
					d = Math.abs( flo );
	
					var intPart = parseInt( d, 10 );
					var floatPart = precision ?
						decimal+(d - intPart).toFixed( precision ).substring( 2 ):
						'';
	
					// If zero, then can't have a negative prefix
					if (intPart === 0 && parseFloat(floatPart) === 0) {
						negative = '';
					}
	
					return negative + (prefix||'') +
						intPart.toString().replace(
							/\B(?=(\d{3})+(?!\d))/g, thousands
						) +
						floatPart +
						(postfix||'');
				}
			};
		},
	
		text: function () {
			return {
				display: __htmlEscapeEntities,
				filter: __htmlEscapeEntities
			};
		}
	};
	
	
	/*
	 * This is really a good bit rubbish this method of exposing the internal methods
	 * publicly... - To be fixed in 2.0 using methods on the prototype
	 */
	
	
	/**
	 * Create a wrapper function for exporting an internal functions to an external API.
	 *  @param {string} fn API function name
	 *  @returns {function} wrapped function
	 *  @memberof DataTable#internal
	 */
	function _fnExternApiFunc (fn)
	{
		return function() {
			var args = [_fnSettingsFromNode( this[DataTable.ext.iApiIndex] )].concat(
				Array.prototype.slice.call(arguments)
			);
			return DataTable.ext.internal[fn].apply( this, args );
		};
	}
	
	
	/**
	 * Reference to internal functions for use by plug-in developers. Note that
	 * these methods are references to internal functions and are considered to be
	 * private. If you use these methods, be aware that they are liable to change
	 * between versions.
	 *  @namespace
	 */
	$.extend( DataTable.ext.internal, {
		_fnExternApiFunc: _fnExternApiFunc,
		_fnBuildAjax: _fnBuildAjax,
		_fnAjaxUpdate: _fnAjaxUpdate,
		_fnAjaxParameters: _fnAjaxParameters,
		_fnAjaxUpdateDraw: _fnAjaxUpdateDraw,
		_fnAjaxDataSrc: _fnAjaxDataSrc,
		_fnAddColumn: _fnAddColumn,
		_fnColumnOptions: _fnColumnOptions,
		_fnAdjustColumnSizing: _fnAdjustColumnSizing,
		_fnVisibleToColumnIndex: _fnVisibleToColumnIndex,
		_fnColumnIndexToVisible: _fnColumnIndexToVisible,
		_fnVisbleColumns: _fnVisbleColumns,
		_fnGetColumns: _fnGetColumns,
		_fnColumnTypes: _fnColumnTypes,
		_fnApplyColumnDefs: _fnApplyColumnDefs,
		_fnHungarianMap: _fnHungarianMap,
		_fnCamelToHungarian: _fnCamelToHungarian,
		_fnLanguageCompat: _fnLanguageCompat,
		_fnBrowserDetect: _fnBrowserDetect,
		_fnAddData: _fnAddData,
		_fnAddTr: _fnAddTr,
		_fnNodeToDataIndex: _fnNodeToDataIndex,
		_fnNodeToColumnIndex: _fnNodeToColumnIndex,
		_fnGetCellData: _fnGetCellData,
		_fnSetCellData: _fnSetCellData,
		_fnSplitObjNotation: _fnSplitObjNotation,
		_fnGetObjectDataFn: _fnGetObjectDataFn,
		_fnSetObjectDataFn: _fnSetObjectDataFn,
		_fnGetDataMaster: _fnGetDataMaster,
		_fnClearTable: _fnClearTable,
		_fnDeleteIndex: _fnDeleteIndex,
		_fnInvalidate: _fnInvalidate,
		_fnGetRowElements: _fnGetRowElements,
		_fnCreateTr: _fnCreateTr,
		_fnBuildHead: _fnBuildHead,
		_fnDrawHead: _fnDrawHead,
		_fnDraw: _fnDraw,
		_fnReDraw: _fnReDraw,
		_fnAddOptionsHtml: _fnAddOptionsHtml,
		_fnDetectHeader: _fnDetectHeader,
		_fnGetUniqueThs: _fnGetUniqueThs,
		_fnFeatureHtmlFilter: _fnFeatureHtmlFilter,
		_fnFilterComplete: _fnFilterComplete,
		_fnFilterCustom: _fnFilterCustom,
		_fnFilterColumn: _fnFilterColumn,
		_fnFilter: _fnFilter,
		_fnFilterCreateSearch: _fnFilterCreateSearch,
		_fnEscapeRegex: _fnEscapeRegex,
		_fnFilterData: _fnFilterData,
		_fnFeatureHtmlInfo: _fnFeatureHtmlInfo,
		_fnUpdateInfo: _fnUpdateInfo,
		_fnInfoMacros: _fnInfoMacros,
		_fnInitialise: _fnInitialise,
		_fnInitComplete: _fnInitComplete,
		_fnLengthChange: _fnLengthChange,
		_fnFeatureHtmlLength: _fnFeatureHtmlLength,
		_fnFeatureHtmlPaginate: _fnFeatureHtmlPaginate,
		_fnPageChange: _fnPageChange,
		_fnFeatureHtmlProcessing: _fnFeatureHtmlProcessing,
		_fnProcessingDisplay: _fnProcessingDisplay,
		_fnFeatureHtmlTable: _fnFeatureHtmlTable,
		_fnScrollDraw: _fnScrollDraw,
		_fnApplyToChildren: _fnApplyToChildren,
		_fnCalculateColumnWidths: _fnCalculateColumnWidths,
		_fnThrottle: _fnThrottle,
		_fnConvertToWidth: _fnConvertToWidth,
		_fnGetWidestNode: _fnGetWidestNode,
		_fnGetMaxLenString: _fnGetMaxLenString,
		_fnStringToCss: _fnStringToCss,
		_fnSortFlatten: _fnSortFlatten,
		_fnSort: _fnSort,
		_fnSortAria: _fnSortAria,
		_fnSortListener: _fnSortListener,
		_fnSortAttachListener: _fnSortAttachListener,
		_fnSortingClasses: _fnSortingClasses,
		_fnSortData: _fnSortData,
		_fnSaveState: _fnSaveState,
		_fnLoadState: _fnLoadState,
		_fnSettingsFromNode: _fnSettingsFromNode,
		_fnLog: _fnLog,
		_fnMap: _fnMap,
		_fnBindAction: _fnBindAction,
		_fnCallbackReg: _fnCallbackReg,
		_fnCallbackFire: _fnCallbackFire,
		_fnLengthOverflow: _fnLengthOverflow,
		_fnRenderer: _fnRenderer,
		_fnDataSource: _fnDataSource,
		_fnRowAttributes: _fnRowAttributes,
		_fnExtend: _fnExtend,
		_fnCalculateEnd: function () {} // Used by a lot of plug-ins, but redundant
		                                // in 1.10, so this dead-end function is
		                                // added to prevent errors
	} );
	

	// jQuery access
	$.fn.dataTable = DataTable;

	// Provide access to the host jQuery object (circular reference)
	DataTable.$ = $;

	// Legacy aliases
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;

	// With a capital `D` we return a DataTables API instance rather than a
	// jQuery object
	$.fn.DataTable = function ( opts ) {
		return $(this).dataTable( opts ).api();
	};

	// All properties that are available to $.fn.dataTable should also be
	// available on $.fn.DataTable
	$.each( DataTable, function ( prop, val ) {
		$.fn.DataTable[ prop ] = val;
	} );


	// Information about events fired by DataTables - for documentation.
	/**
	 * Draw event, fired whenever the table is redrawn on the page, at the same
	 * point as fnDrawCallback. This may be useful for binding events or
	 * performing calculations when the table is altered at all.
	 *  @name DataTable#draw.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Search event, fired when the searching applied to the table (using the
	 * built-in global search, or column filters) is altered.
	 *  @name DataTable#search.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Page change event, fired when the paging of the table is altered.
	 *  @name DataTable#page.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Order event, fired when the ordering applied to the table is altered.
	 *  @name DataTable#order.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * DataTables initialisation complete event, fired when the table is fully
	 * drawn, including Ajax data loaded, if Ajax data is required.
	 *  @name DataTable#init.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The JSON object request from the server - only
	 *    present if client-side Ajax sourced data is used</li></ol>
	 */

	/**
	 * State save event, fired when the table has changed state a new state save
	 * is required. This event allows modification of the state saving object
	 * prior to actually doing the save, including addition or other state
	 * properties (for plug-ins) or modification of a DataTables core property.
	 *  @name DataTable#stateSaveParams.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The state information to be saved
	 */

	/**
	 * State load event, fired when the table is loading state from the stored
	 * data, but prior to the settings object being modified by the saved state
	 * - allowing modification of the saved state is required or loading of
	 * state for a plug-in.
	 *  @name DataTable#stateLoadParams.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The saved state information
	 */

	/**
	 * State loaded event, fired when state has been loaded from stored data and
	 * the settings object has been modified by the loaded data.
	 *  @name DataTable#stateLoaded.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The saved state information
	 */

	/**
	 * Processing event, fired when DataTables is doing some kind of processing
	 * (be it, order, search or anything else). It can be used to indicate to
	 * the end user that there is something happening, or that something has
	 * finished.
	 *  @name DataTable#processing.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {boolean} bShow Flag for if DataTables is doing processing or not
	 */

	/**
	 * Ajax (XHR) event, fired whenever an Ajax request is completed from a
	 * request to made to the server for new data. This event is called before
	 * DataTables processed the returned data, so it can also be used to pre-
	 * process the data returned from the server, if needed.
	 *
	 * Note that this trigger is called in `fnServerData`, if you override
	 * `fnServerData` and which to use this event, you need to trigger it in you
	 * success function.
	 *  @name DataTable#xhr.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 *  @param {object} json JSON returned from the server
	 *
	 *  @example
	 *     // Use a custom property returned from the server in another DOM element
	 *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
	 *       $('#status').html( json.status );
	 *     } );
	 *
	 *  @example
	 *     // Pre-process the data returned from the server
	 *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
	 *       for ( var i=0, ien=json.aaData.length ; i<ien ; i++ ) {
	 *         json.aaData[i].sum = json.aaData[i].one + json.aaData[i].two;
	 *       }
	 *       // Note no return - manipulate the data directly in the JSON object.
	 *     } );
	 */

	/**
	 * Destroy event, fired when the DataTable is destroyed by calling fnDestroy
	 * or passing the bDestroy:true parameter in the initialisation object. This
	 * can be used to remove bound events, added DOM nodes, etc.
	 *  @name DataTable#destroy.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Page length change event, fired when number of records to show on each
	 * page (the length) is changed.
	 *  @name DataTable#length.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 *  @param {integer} len New length
	 */

	/**
	 * Column sizing has changed.
	 *  @name DataTable#column-sizing.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Column visibility has changed.
	 *  @name DataTable#column-visibility.dt
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 *  @param {int} column Column index
	 *  @param {bool} vis `false` if column now hidden, or `true` if visible
	 */

	return $.fn.dataTable;
}));

/*! DataTables Bootstrap 5 integration
 * 2020 SpryMedia Ltd - datatables.net/license
 */

/**
 * DataTables integration for Bootstrap 4. This requires Bootstrap 5 and
 * DataTables 1.10 or newer.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
 * for further information.
 */
(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				// Require DataTables, which attaches to jQuery, including
				// jQuery if needed and have a $ property so we can access the
				// jQuery object that is used
				$ = require('datatables.net')(root, $).$;
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;


/* Set the defaults for DataTables initialisation */
$.extend( true, DataTable.defaults, {
	dom:
		"<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
		"<'row'<'col-sm-12'tr>>" +
		"<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
	renderer: 'bootstrap'
} );


/* Default class modification */
$.extend( DataTable.ext.classes, {
	sWrapper:      "dataTables_wrapper dt-bootstrap5",
	sFilterInput:  "form-control form-control-sm",
	sLengthSelect: "form-select form-select-sm",
	sProcessing:   "dataTables_processing card",
	sPageButton:   "paginate_button page-item"
} );


/* Bootstrap paging button renderer */
DataTable.ext.renderer.pageButton.bootstrap = function ( settings, host, idx, buttons, page, pages ) {
	var api     = new DataTable.Api( settings );
	var classes = settings.oClasses;
	var lang    = settings.oLanguage.oPaginate;
	var aria = settings.oLanguage.oAria.paginate || {};
	var btnDisplay, btnClass, counter=0;

	var attach = function( container, buttons ) {
		var i, ien, node, button;
		var clickHandler = function ( e ) {
			e.preventDefault();
			if ( !$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action ) {
				api.page( e.data.action ).draw( 'page' );
			}
		};

		for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
			button = buttons[i];

			if ( Array.isArray( button ) ) {
				attach( container, button );
			}
			else {
				btnDisplay = '';
				btnClass = '';

				switch ( button ) {
					case 'ellipsis':
						btnDisplay = '&#x2026;';
						btnClass = 'disabled';
						break;

					case 'first':
						btnDisplay = lang.sFirst;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'previous':
						btnDisplay = lang.sPrevious;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'next':
						btnDisplay = lang.sNext;
						btnClass = button + (page < pages-1 ?
							'' : ' disabled');
						break;

					case 'last':
						btnDisplay = lang.sLast;
						btnClass = button + (page < pages-1 ?
							'' : ' disabled');
						break;

					default:
						btnDisplay = button + 1;
						btnClass = page === button ?
							'active' : '';
						break;
				}

				if ( btnDisplay ) {
					node = $('<li>', {
							'class': classes.sPageButton+' '+btnClass,
							'id': idx === 0 && typeof button === 'string' ?
								settings.sTableId +'_'+ button :
								null
						} )
						.append( $('<a>', {
								'href': '#',
								'aria-controls': settings.sTableId,
								'aria-label': aria[ button ],
								'data-dt-idx': counter,
								'tabindex': settings.iTabIndex,
								'class': 'page-link'
							} )
							.html( btnDisplay )
						)
						.appendTo( container );

					settings.oApi._fnBindAction(
						node, {action: button}, clickHandler
					);

					counter++;
				}
			}
		}
	};

	// IE9 throws an 'unknown error' if document.activeElement is used
	// inside an iframe or frame. 
	var activeEl;

	try {
		// Because this approach is destroying and recreating the paging
		// elements, focus is lost on the select button which is bad for
		// accessibility. So we want to restore focus once the draw has
		// completed
		activeEl = $(host).find(document.activeElement).data('dt-idx');
	}
	catch (e) {}

	attach(
		$(host).empty().html('<ul class="pagination"/>').children('ul'),
		buttons
	);

	if ( activeEl !== undefined ) {
		$(host).find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
	}
};


return DataTable;
}));

"use strict";

//
// Datatables.net Initialization
//

// Set Defaults

var defaults = {
	"language": {		
		"info": "Showing _START_ to _END_ of _TOTAL_ records",
    	"infoEmpty": "Showing no records",
		"lengthMenu": "_MENU_",
		"paginate": {
			"first": '<i class="first"></i>',
			"last": '<i class="last"></i>',
			"next": '<i class="next"></i>',
			"previous": '<i class="previous"></i>'
		}
	}
};

$.extend(true, $.fn.dataTable.defaults, defaults);

/*! DataTables Bootstrap 4 integration
 * ©2011-2017 SpryMedia Ltd - datatables.net/license
 */

/**
 * DataTables integration for Bootstrap 4. This requires Bootstrap 4 and
 * DataTables 1.10 or newer.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
 * for further information.
 */
(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				// Require DataTables, which attaches to jQuery, including
				// jQuery if needed and have a $ property so we can access the
				// jQuery object that is used
				$ = require('datatables.net')(root, $).$;
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;


/* Set the defaults for DataTables initialisation */
$.extend( true, DataTable.defaults, {
	dom: 
		"<'table-responsive'tr>" +
		
		"<'row'" + 
		"<'col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'li>" + 
		"<'col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'p>" +
		">",
	
	renderer: 'bootstrap'
} );


/* Default class modification */
$.extend( DataTable.ext.classes, {
	sWrapper:      "dataTables_wrapper dt-bootstrap4",
	sFilterInput:  "form-control form-control-sm form-control-solid",
	sLengthSelect: "form-select form-select-sm form-select-solid",
	sProcessing:   "dataTables_processing",
	sPageButton:   "paginate_button page-item"
} );


/* Bootstrap paging button renderer */
DataTable.ext.renderer.pageButton.bootstrap = function ( settings, host, idx, buttons, page, pages ) {
	var api     = new DataTable.Api( settings );
	var classes = settings.oClasses;
	var lang    = settings.oLanguage.oPaginate;
	var aria = settings.oLanguage.oAria.paginate || {};
	var btnDisplay, btnClass, counter=0;

	var attach = function( container, buttons ) {
		var i, ien, node, button;
		var clickHandler = function ( e ) {
			e.preventDefault();
			if ( !$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action ) {
				api.page( e.data.action ).draw( 'page' );
			}
		};

		for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
			button = buttons[i];

			if ( Array.isArray( button ) ) {
				attach( container, button );
			}
			else {
				btnDisplay = '';
				btnClass = '';

				switch ( button ) {
					case 'ellipsis':
						btnDisplay = '&#x2026;';
						btnClass = 'disabled';
						break;

					case 'first':
						btnDisplay = lang.sFirst;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'previous':
						btnDisplay = lang.sPrevious;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'next':
						btnDisplay = lang.sNext;
						btnClass = button + (page < pages-1 ?
							'' : ' disabled');
						break;

					case 'last':
						btnDisplay = lang.sLast;
						btnClass = button + (page < pages-1 ?
							'' : ' disabled');
						break;

					default:
						btnDisplay = button + 1;
						btnClass = page === button ?
							'active' : '';
						break;
				}

				if ( btnDisplay ) {
					node = $('<li>', {
							'class': classes.sPageButton+' '+btnClass,
							'id': idx === 0 && typeof button === 'string' ?
								settings.sTableId +'_'+ button :
								null
						} )
						.append( $('<a>', {
								'href': '#',
								'aria-controls': settings.sTableId,
								'aria-label': aria[ button ],
								'data-dt-idx': counter,
								'tabindex': settings.iTabIndex,
								'class': 'page-link'
							} )
							.html( btnDisplay )
						)
						.appendTo( container );

					settings.oApi._fnBindAction(
						node, {action: button}, clickHandler
					);

					counter++;
				}
			}
		}
	};

	// IE9 throws an 'unknown error' if document.activeElement is used
	// inside an iframe or frame.
	var activeEl;

	try {
		// Because this approach is destroying and recreating the paging
		// elements, focus is lost on the select button which is bad for
		// accessibility. So we want to restore focus once the draw has
		// completed
		activeEl = $(host).find(document.activeElement).data('dt-idx');
	}
	catch (e) {}

	attach(
		$(host).empty().html('<ul class="pagination"/>').children('ul'),
		buttons
	);

	if ( activeEl !== undefined ) {
		$(host).find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
	}
};


return DataTable;
}));

/*!

JSZip v3.7.0 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).JSZip=e()}}(function(){return function s(o,a,f){function u(r,e){if(!a[r]){if(!o[r]){var t="function"==typeof require&&require;if(!e&&t)return t(r,!0);if(d)return d(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[r]={exports:{}};o[r][0].call(i.exports,function(e){var t=o[r][1][e];return u(t||e)},i,i.exports,s,o,a,f)}return a[r].exports}for(var d="function"==typeof require&&require,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(e,t,r){"use strict";var c=e("./utils"),h=e("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(e){for(var t,r,n,i,s,o,a,f=[],u=0,d=e.length,h=d,l="string"!==c.getTypeOf(e);u<e.length;)h=d-u,n=l?(t=e[u++],r=u<d?e[u++]:0,u<d?e[u++]:0):(t=e.charCodeAt(u++),r=u<d?e.charCodeAt(u++):0,u<d?e.charCodeAt(u++):0),i=t>>2,s=(3&t)<<4|r>>4,o=1<h?(15&r)<<2|n>>6:64,a=2<h?63&n:64,f.push(p.charAt(i)+p.charAt(s)+p.charAt(o)+p.charAt(a));return f.join("")},r.decode=function(e){var t,r,n,i,s,o,a=0,f=0;if("data:"===e.substr(0,"data:".length))throw new Error("Invalid base64 input, it looks like a data url.");var u,d=3*(e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"")).length/4;if(e.charAt(e.length-1)===p.charAt(64)&&d--,e.charAt(e.length-2)===p.charAt(64)&&d--,d%1!=0)throw new Error("Invalid base64 input, bad content length.");for(u=h.uint8array?new Uint8Array(0|d):new Array(0|d);a<e.length;)t=p.indexOf(e.charAt(a++))<<2|(i=p.indexOf(e.charAt(a++)))>>4,r=(15&i)<<4|(s=p.indexOf(e.charAt(a++)))>>2,n=(3&s)<<6|(o=p.indexOf(e.charAt(a++))),u[f++]=t,64!==s&&(u[f++]=r),64!==o&&(u[f++]=n);return u}},{"./support":30,"./utils":32}],2:[function(e,t,r){"use strict";var n=e("./external"),i=e("./stream/DataWorker"),s=e("./stream/Crc32Probe"),o=e("./stream/DataLengthProbe");function a(e,t,r,n,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=r,this.compression=n,this.compressedContent=i}a.prototype={getContentWorker:function(){var e=new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new o("data_length")),t=this;return e.on("end",function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),e},getCompressedWorker:function(){return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},a.createWorkerFrom=function(e,t,r){return e.pipe(new s).pipe(new o("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new o("compressedSize")).withStreamInfo("compression",t)},t.exports=a},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,r){"use strict";var n=e("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(e){return new n("STORE compression")},uncompressWorker:function(){return new n("STORE decompression")}},r.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,r){"use strict";var n=e("./utils"),o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t){return void 0!==e&&e.length?"string"!==n.getTypeOf(e)?function(e,t,r){var n=o,i=0+r;e^=-1;for(var s=0;s<i;s++)e=e>>>8^n[255&(e^t[s])];return-1^e}(0|t,e,e.length):function(e,t,r){var n=o,i=0+r;e^=-1;for(var s=0;s<i;s++)e=e>>>8^n[255&(e^t.charCodeAt(s))];return-1^e}(0|t,e,e.length):0}},{"./utils":32}],5:[function(e,t,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(e,t,r){"use strict";var n;n="undefined"!=typeof Promise?Promise:e("lie"),t.exports={Promise:n}},{lie:37}],7:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,i=e("pako"),s=e("./utils"),o=e("./stream/GenericWorker"),a=n?"uint8array":"array";function f(e,t){o.call(this,"FlateWorker/"+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}r.magic="\b\0",s.inherits(f,o),f.prototype.processChunk=function(e){this.meta=e.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(a,e.data),!1)},f.prototype.flush=function(){o.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},f.prototype.cleanUp=function(){o.prototype.cleanUp.call(this),this._pako=null},f.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var t=this;this._pako.onData=function(e){t.push({data:e,meta:t.meta})}},r.compressWorker=function(e){return new f("Deflate",e)},r.uncompressWorker=function(){return new f("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,r){"use strict";function O(e,t){var r,n="";for(r=0;r<t;r++)n+=String.fromCharCode(255&e),e>>>=8;return n}function i(e,t,r,n,i,s){var o,a,f=e.file,u=e.compression,d=s!==D.utf8encode,h=I.transformTo("string",s(f.name)),l=I.transformTo("string",D.utf8encode(f.name)),c=f.comment,p=I.transformTo("string",s(c)),m=I.transformTo("string",D.utf8encode(c)),_=l.length!==f.name.length,w=m.length!==c.length,v="",g="",y="",b=f.dir,k=f.date,x={crc32:0,compressedSize:0,uncompressedSize:0};t&&!r||(x.crc32=e.crc32,x.compressedSize=e.compressedSize,x.uncompressedSize=e.uncompressedSize);var S=0;t&&(S|=8),d||!_&&!w||(S|=2048);var E,z=0,C=0;b&&(z|=16),"UNIX"===i?(C=798,z|=((E=f.unixPermissions)||(E=b?16893:33204),(65535&E)<<16)):(C=20,z|=63&(f.dosPermissions||0)),o=k.getUTCHours(),o<<=6,o|=k.getUTCMinutes(),o<<=5,o|=k.getUTCSeconds()/2,a=k.getUTCFullYear()-1980,a<<=4,a|=k.getUTCMonth()+1,a<<=5,a|=k.getUTCDate(),_&&(v+="up"+O((g=O(1,1)+O(B(h),4)+l).length,2)+g),w&&(v+="uc"+O((y=O(1,1)+O(B(p),4)+m).length,2)+y);var A="";return A+="\n\0",A+=O(S,2),A+=u.magic,A+=O(o,2),A+=O(a,2),A+=O(x.crc32,4),A+=O(x.compressedSize,4),A+=O(x.uncompressedSize,4),A+=O(h.length,2),A+=O(v.length,2),{fileRecord:T.LOCAL_FILE_HEADER+A+h+v,dirRecord:T.CENTRAL_FILE_HEADER+O(C,2)+A+O(p.length,2)+"\0\0\0\0"+O(z,4)+O(n,4)+h+v+p}}var I=e("../utils"),s=e("../stream/GenericWorker"),D=e("../utf8"),B=e("../crc32"),T=e("../signature");function n(e,t,r,n){s.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=r,this.encodeFileName=n,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(n,s),n.prototype.push=function(e){var t=e.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,s.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:r?(t+100*(r-n-1))/r:100}}))},n.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var r=i(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},n.prototype.closedSource=function(e){this.accumulate=!1;var t,r=this.streamFiles&&!e.file.dir,n=i(e,r,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(n.dirRecord),r)this.push({data:(t=e,T.DATA_DESCRIPTOR+O(t.crc32,4)+O(t.compressedSize,4)+O(t.uncompressedSize,4)),meta:{percent:100}});else for(this.push({data:n.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},n.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var r,n,i,s,o,a,f=this.bytesWritten-e,u=(r=this.dirRecords.length,n=f,i=e,s=this.zipComment,o=this.encodeFileName,a=I.transformTo("string",o(s)),T.CENTRAL_DIRECTORY_END+"\0\0\0\0"+O(r,2)+O(r,2)+O(n,4)+O(i,4)+O(a.length,2)+a);this.push({data:u,meta:{percent:100}})},n.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},n.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on("error",function(e){t.error(e)}),this},n.prototype.resume=function(){return!!s.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},n.prototype.error=function(e){var t=this._sources;if(!s.prototype.error.call(this,e))return!1;for(var r=0;r<t.length;r++)try{t[r].error(e)}catch(e){}return!0},n.prototype.lock=function(){s.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=n},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,r){"use strict";var u=e("../compressions"),n=e("./ZipFileWorker");r.generateWorker=function(e,o,t){var a=new n(o.streamFiles,t,o.platform,o.encodeFileName),f=0;try{e.forEach(function(e,t){f++;var r=function(e,t){var r=e||t,n=u[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(t.options.compression,o.compression),n=t.options.compressionOptions||o.compressionOptions||{},i=t.dir,s=t.date;t._compressWorker(r,n).withStreamInfo("file",{name:e,dir:i,date:s,comment:t.comment||"",unixPermissions:t.unixPermissions,dosPermissions:t.dosPermissions}).pipe(a)}),a.entriesCount=f}catch(e){a.error(e)}return a}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,r){"use strict";function n(){if(!(this instanceof n))return new n;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files={},this.comment=null,this.root="",this.clone=function(){var e=new n;for(var t in this)"function"!=typeof this[t]&&(e[t]=this[t]);return e}}(n.prototype=e("./object")).loadAsync=e("./load"),n.support=e("./support"),n.defaults=e("./defaults"),n.version="3.5.0",n.loadAsync=function(e,t){return(new n).loadAsync(e,t)},n.external=e("./external"),t.exports=n},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,r){"use strict";var n=e("./utils"),i=e("./external"),a=e("./utf8"),f=e("./zipEntries"),s=e("./stream/Crc32Probe"),u=e("./nodejsUtils");function d(n){return new i.Promise(function(e,t){var r=n.decompressed.getContentWorker().pipe(new s);r.on("error",function(e){t(e)}).on("end",function(){r.streamInfo.crc32!==n.decompressed.crc32?t(new Error("Corrupted zip : CRC32 mismatch")):e()}).resume()})}t.exports=function(e,s){var o=this;return s=n.extend(s||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:a.utf8decode}),u.isNode&&u.isStream(e)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):n.prepareContent("the loaded zip file",e,!0,s.optimizedBinaryString,s.base64).then(function(e){var t=new f(s);return t.load(e),t}).then(function(e){var t=[i.Promise.resolve(e)],r=e.files;if(s.checkCRC32)for(var n=0;n<r.length;n++)t.push(d(r[n]));return i.Promise.all(t)}).then(function(e){for(var t=e.shift(),r=t.files,n=0;n<r.length;n++){var i=r[n];o.file(i.fileNameStr,i.decompressed,{binary:!0,optimizedBinaryString:!0,date:i.date,dir:i.dir,comment:i.fileCommentStr.length?i.fileCommentStr:null,unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions,createFolders:s.createFolders})}return t.zipComment.length&&(o.comment=t.zipComment),o})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../stream/GenericWorker");function s(e,t){i.call(this,"Nodejs stream input adapter for "+e),this._upstreamEnded=!1,this._bindStream(t)}n.inherits(s,i),s.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on("data",function(e){t.push({data:e,meta:{percent:0}})}).on("error",function(e){t.isPaused?this.generatedError=e:t.error(e)}).on("end",function(){t.isPaused?t._upstreamEnded=!0:t.end()})},s.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,r){"use strict";var i=e("readable-stream").Readable;function n(e,t,r){i.call(this,t),this._helper=e;var n=this;e.on("data",function(e,t){n.push(e)||n._helper.pause(),r&&r(t)}).on("error",function(e){n.emit("error",e)}).on("end",function(){n.push(null)})}e("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},t.exports=n},{"../utils":32,"readable-stream":16}],14:[function(e,t,r){"use strict";t.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if("number"==typeof e)throw new Error('The "data" argument must not be a number');return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&"function"==typeof e.on&&"function"==typeof e.pause&&"function"==typeof e.resume}}},{}],15:[function(e,t,r){"use strict";function s(e,t,r){var n,i=d.getTypeOf(t),s=d.extend(r||{},l);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=u(e)),s.createFolders&&(n=function(e){"/"===e.slice(-1)&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf("/");return 0<t?e.substring(0,t):""}(e))&&w.call(this,n,!0);var o,a="string"===i&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(t instanceof c&&0===t.uncompressedSize||s.dir||!t||0===t.length)&&(s.base64=!1,s.binary=!0,t="",s.compression="STORE",i="string"),o=t instanceof c||t instanceof h?t:m.isNode&&m.isStream(t)?new _(e,t):d.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var f=new p(e,o,s);this.files[e]=f}function u(e){return"/"!==e.slice(-1)&&(e+="/"),e}var i=e("./utf8"),d=e("./utils"),h=e("./stream/GenericWorker"),o=e("./stream/StreamHelper"),l=e("./defaults"),c=e("./compressedObject"),p=e("./zipObject"),a=e("./generate"),m=e("./nodejsUtils"),_=e("./nodejs/NodejsStreamInputAdapter"),w=function(e,t){return t=void 0!==t?t:l.createFolders,e=u(e),this.files[e]||s.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function f(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var n={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(e){var t,r,n;for(t in this.files)this.files.hasOwnProperty(t)&&(n=this.files[t],(r=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(r,n))},filter:function(r){var n=[];return this.forEach(function(e,t){r(e,t)&&n.push(t)}),n},file:function(e,t,r){if(1!==arguments.length)return e=this.root+e,s.call(this,e,t,r),this;if(f(e)){var n=e;return this.filter(function(e,t){return!t.dir&&n.test(e)})}var i=this.files[this.root+e];return i&&!i.dir?i:null},folder:function(r){if(!r)return this;if(f(r))return this.filter(function(e,t){return t.dir&&r.test(e)});var e=this.root+r,t=w.call(this,e),n=this.clone();return n.root=t.name,n},remove:function(r){r=this.root+r;var e=this.files[r];if(e||("/"!==r.slice(-1)&&(r+="/"),e=this.files[r]),e&&!e.dir)delete this.files[r];else for(var t=this.filter(function(e,t){return t.name.slice(0,r.length)===r}),n=0;n<t.length;n++)delete this.files[t[n].name];return this},generate:function(e){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(e){var t,r={};try{if((r=d.extend(e||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");d.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var n=r.comment||this.comment||"";t=a.generateWorker(this,r,n)}catch(e){(t=new h("error")).error(e)}return new o(t,r.type||"string",r.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e=e||{}).type||(e.type="nodebuffer"),this.generateInternalStream(e).toNodejsStream(t)}};t.exports=n},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,r){t.exports=e("stream")},{stream:void 0}],17:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===t&&this.data[s+1]===r&&this.data[s+2]===n&&this.data[s+3]===i)return s-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.readData(4);return t===s[0]&&r===s[1]&&n===s[2]&&i===s[3]},i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,r){"use strict";var n=e("../utils");function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(e){},readInt:function(e){var t,r=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)r=(r<<8)+this.byteAt(t);return this.index+=e,r},readString:function(e){return n.transformTo("string",this.readData(e))},readData:function(e){},lastIndexOfSignature:function(e){},readAndCheckSignature:function(e){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,r){"use strict";var n=e("./Uint8ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,r){"use strict";var n=e("./ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return new Uint8Array(0);var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../support"),s=e("./ArrayReader"),o=e("./StringReader"),a=e("./NodeBufferReader"),f=e("./Uint8ArrayReader");t.exports=function(e){var t=n.getTypeOf(e);return n.checkSupport(t),"string"!==t||i.uint8array?"nodebuffer"===t?new a(e):i.uint8array?new f(n.transformTo("uint8array",e)):new s(n.transformTo("array",e)):new o(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../utils");function s(e){n.call(this,"ConvertWorker to "+e),this.destType=e}i.inherits(s,n),s.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../crc32");function s(){n.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(s,n),s.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataLengthProbe for "+e),this.propName=e,this.withStreamInfo(e,0)}n.inherits(s,i),s.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataWorker");var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=n.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}n.inherits(s,i),s.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,n.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(n.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":e=this.data.substring(this.index,t);break;case"uint8array":e=this.data.subarray(this.index,t);break;case"array":case"nodebuffer":e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,r){"use strict";function n(e){this.name=e||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}n.prototype={push:function(e){this.emit("data",e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(e){this.emit("error",e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit("error",e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var r=0;r<this._listeners[e].length;r++)this._listeners[e][r].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.end()}),e.on("error",function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)this.extraStreamInfo.hasOwnProperty(e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e="Worker "+this.name;return this.previous?this.previous+" -> "+e:e}},t.exports=n},{}],29:[function(e,t,r){"use strict";var u=e("../utils"),i=e("./ConvertWorker"),s=e("./GenericWorker"),d=e("../base64"),n=e("../support"),o=e("../external"),a=null;if(n.nodestream)try{a=e("../nodejs/NodejsStreamOutputAdapter")}catch(e){}function f(e,t,r){var n=t;switch(t){case"blob":case"arraybuffer":n="uint8array";break;case"base64":n="string"}try{this._internalType=n,this._outputType=t,this._mimeType=r,u.checkSupport(n),this._worker=e.pipe(new i(n)),e.lock()}catch(e){this._worker=new s("error"),this._worker.error(e)}}f.prototype={accumulate:function(e){return a=this,f=e,new o.Promise(function(t,r){var n=[],i=a._internalType,s=a._outputType,o=a._mimeType;a.on("data",function(e,t){n.push(e),f&&f(t)}).on("error",function(e){n=[],r(e)}).on("end",function(){try{var e=function(e,t,r){switch(e){case"blob":return u.newBlob(u.transformTo("arraybuffer",t),r);case"base64":return d.encode(t);default:return u.transformTo(e,t)}}(s,function(e,t){var r,n=0,i=null,s=0;for(r=0;r<t.length;r++)s+=t[r].length;switch(e){case"string":return t.join("");case"array":return Array.prototype.concat.apply([],t);case"uint8array":for(i=new Uint8Array(s),r=0;r<t.length;r++)i.set(t[r],n),n+=t[r].length;return i;case"nodebuffer":return Buffer.concat(t);default:throw new Error("concat : unsupported type '"+e+"'")}}(i,n),o);t(e)}catch(e){r(e)}n=[]}).resume()});var a,f},on:function(e,t){var r=this;return"data"===e?this._worker.on(e,function(e){t.call(r,e.data,e.meta)}):this._worker.on(e,function(){u.delay(t,arguments,r)}),this},resume:function(){return u.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(u.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new a(this,{objectMode:"nodebuffer"!==this._outputType},e)}},t.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var n=new ArrayBuffer(0);try{r.blob=0===new Blob([n],{type:"application/zip"}).size}catch(e){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(n),r.blob=0===i.getBlob("application/zip").size}catch(e){r.blob=!1}}}try{r.nodestream=!!e("readable-stream").Readable}catch(e){r.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,s){"use strict";for(var a=e("./utils"),f=e("./support"),r=e("./nodejsUtils"),n=e("./stream/GenericWorker"),u=new Array(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;function o(){n.call(this,"utf-8 decode"),this.leftOver=null}function d(){n.call(this,"utf-8 encode")}u[254]=u[254]=1,s.utf8encode=function(e){return f.nodebuffer?r.newBufferFrom(e,"utf-8"):function(e){var t,r,n,i,s,o=e.length,a=0;for(i=0;i<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<o&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),a+=r<128?1:r<2048?2:r<65536?3:4;for(t=f.uint8array?new Uint8Array(a):new Array(a),i=s=0;s<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<o&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t}(e)},s.utf8decode=function(e){return f.nodebuffer?a.transformTo("nodebuffer",e).toString("utf-8"):function(e){var t,r,n,i,s=e.length,o=new Array(2*s);for(t=r=0;t<s;)if((n=e[t++])<128)o[r++]=n;else if(4<(i=u[n]))o[r++]=65533,t+=i-1;else{for(n&=2===i?31:3===i?15:7;1<i&&t<s;)n=n<<6|63&e[t++],i--;1<i?o[r++]=65533:n<65536?o[r++]=n:(n-=65536,o[r++]=55296|n>>10&1023,o[r++]=56320|1023&n)}return o.length!==r&&(o.subarray?o=o.subarray(0,r):o.length=r),a.applyFromCharCode(o)}(e=a.transformTo(f.uint8array?"uint8array":"array",e))},a.inherits(o,n),o.prototype.processChunk=function(e){var t=a.transformTo(f.uint8array?"uint8array":"array",e.data);if(this.leftOver&&this.leftOver.length){if(f.uint8array){var r=t;(t=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),t.set(r,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var n=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}(t),i=t;n!==t.length&&(f.uint8array?(i=t.subarray(0,n),this.leftOver=t.subarray(n,t.length)):(i=t.slice(0,n),this.leftOver=t.slice(n,t.length))),this.push({data:s.utf8decode(i),meta:e.meta})},o.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=o,a.inherits(d,n),d.prototype.processChunk=function(e){this.push({data:s.utf8encode(e.data),meta:e.meta})},s.Utf8EncodeWorker=d},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,a){"use strict";var f=e("./support"),u=e("./base64"),r=e("./nodejsUtils"),n=e("set-immediate-shim"),d=e("./external");function i(e){return e}function h(e,t){for(var r=0;r<e.length;++r)t[r]=255&e.charCodeAt(r);return t}a.newBlob=function(t,r){a.checkSupport("blob");try{return new Blob([t],{type:r})}catch(e){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return n.append(t),n.getBlob(r)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};var s={stringifyByChunk:function(e,t,r){var n=[],i=0,s=e.length;if(s<=r)return String.fromCharCode.apply(null,e);for(;i<s;)"array"===t||"nodebuffer"===t?n.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+r,s)))):n.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+r,s)))),i+=r;return n.join("")},stringifyByChar:function(e){for(var t="",r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return t},applyCanBeUsed:{uint8array:function(){try{return f.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(e){return!1}}(),nodebuffer:function(){try{return f.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(e){return!1}}()}};function o(e){var t=65536,r=a.getTypeOf(e),n=!0;if("uint8array"===r?n=s.applyCanBeUsed.uint8array:"nodebuffer"===r&&(n=s.applyCanBeUsed.nodebuffer),n)for(;1<t;)try{return s.stringifyByChunk(e,r,t)}catch(e){t=Math.floor(t/2)}return s.stringifyByChar(e)}function l(e,t){for(var r=0;r<e.length;r++)t[r]=e[r];return t}a.applyFromCharCode=o;var c={};c.string={string:i,array:function(e){return h(e,new Array(e.length))},arraybuffer:function(e){return c.string.uint8array(e).buffer},uint8array:function(e){return h(e,new Uint8Array(e.length))},nodebuffer:function(e){return h(e,r.allocBuffer(e.length))}},c.array={string:o,array:i,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(e)}},c.arraybuffer={string:function(e){return o(new Uint8Array(e))},array:function(e){return l(new Uint8Array(e),new Array(e.byteLength))},arraybuffer:i,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(new Uint8Array(e))}},c.uint8array={string:o,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:i,nodebuffer:function(e){return r.newBufferFrom(e)}},c.nodebuffer={string:o,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return c.nodebuffer.uint8array(e).buffer},uint8array:function(e){return l(e,new Uint8Array(e.length))},nodebuffer:i},a.transformTo=function(e,t){if(t=t||"",!e)return t;a.checkSupport(e);var r=a.getTypeOf(t);return c[r][e](t)},a.getTypeOf=function(e){return"string"==typeof e?"string":"[object Array]"===Object.prototype.toString.call(e)?"array":f.nodebuffer&&r.isBuffer(e)?"nodebuffer":f.uint8array&&e instanceof Uint8Array?"uint8array":f.arraybuffer&&e instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(e){if(!f[e.toLowerCase()])throw new Error(e+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(e){var t,r,n="";for(r=0;r<(e||"").length;r++)n+="\\x"+((t=e.charCodeAt(r))<16?"0":"")+t.toString(16).toUpperCase();return n},a.delay=function(e,t,r){n(function(){e.apply(r||null,t||[])})},a.inherits=function(e,t){function r(){}r.prototype=t.prototype,e.prototype=new r},a.extend=function(){var e,t,r={};for(e=0;e<arguments.length;e++)for(t in arguments[e])arguments[e].hasOwnProperty(t)&&void 0===r[t]&&(r[t]=arguments[e][t]);return r},a.prepareContent=function(n,e,i,s,o){return d.Promise.resolve(e).then(function(n){return f.blob&&(n instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(n)))&&"undefined"!=typeof FileReader?new d.Promise(function(t,r){var e=new FileReader;e.onload=function(e){t(e.target.result)},e.onerror=function(e){r(e.target.error)},e.readAsArrayBuffer(n)}):n}).then(function(e){var t,r=a.getTypeOf(e);return r?("arraybuffer"===r?e=a.transformTo("uint8array",e):"string"===r&&(o?e=u.decode(e):i&&!0!==s&&(e=h(t=e,f.uint8array?new Uint8Array(t.length):new Array(t.length)))),e):d.Promise.reject(new Error("Can't read the data of '"+n+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,"set-immediate-shim":54}],33:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),i=e("./utils"),s=e("./signature"),o=e("./zipEntry"),a=(e("./utf8"),e("./support"));function f(e){this.files=[],this.loadOptions=e}f.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(t)+", expected "+i.pretty(e)+")")}},isSignature:function(e,t){var r=this.reader.index;this.reader.setIndex(e);var n=this.reader.readString(4)===t;return this.reader.setIndex(r),n},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=a.uint8array?"uint8array":"array",r=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,r,n=this.zip64EndOfCentralSize-44;0<n;)e=this.reader.readInt(2),t=this.reader.readInt(4),r=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e=new o({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(e<0)throw this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(e);var t=e;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(e),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var n=t-r;if(0<n)this.isSignature(t,s.CENTRAL_FILE_HEADER)||(this.reader.zero=n);else if(n<0)throw new Error("Corrupted zip: missing "+Math.abs(n)+" bytes.")},prepareReader:function(e){this.reader=n(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=f},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utf8":31,"./utils":32,"./zipEntry":34}],34:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),s=e("./utils"),i=e("./compressedObject"),o=e("./crc32"),a=e("./utf8"),f=e("./compressions"),u=e("./support");function d(e,t){this.options=e,this.loadOptions=t}d.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,r;if(e.skip(22),this.fileNameLength=e.readInt(2),r=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(t=function(e){for(var t in f)if(f.hasOwnProperty(t)&&f[t].magic===e)return f[t];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new i(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==e&&(this.dosPermissions=63&this.externalFileAttributes),3==e&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(e){if(this.extraFields[1]){var t=n(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=t.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=t.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=t.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=t.readInt(4))}},readExtraFields:function(e){var t,r,n,i=e.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});e.index+4<i;)t=e.readInt(2),r=e.readInt(2),n=e.readData(r),this.extraFields[t]={id:t,length:r,value:n};e.setIndex(i)},handleUTF8:function(){var e=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=a.utf8decode(this.fileName),this.fileCommentStr=a.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(null!==t)this.fileNameStr=t;else{var r=s.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var n=this.findExtraFieldUnicodeComment();if(null!==n)this.fileCommentStr=n;else{var i=s.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(i)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:o(this.fileName)!==t.readInt(4)?null:a.utf8decode(t.readData(e.length-5))}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:o(this.fileComment)!==t.readInt(4)?null:a.utf8decode(t.readData(e.length-5))}return null}},t.exports=d},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,r){"use strict";function n(e,t,r){this.name=e,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=t,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=e("./stream/StreamHelper"),i=e("./stream/DataWorker"),o=e("./utf8"),a=e("./compressedObject"),f=e("./stream/GenericWorker");n.prototype={internalStream:function(e){var t=null,r="string";try{if(!e)throw new Error("No output type specified.");var n="string"===(r=e.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),t=this._decompressWorker();var i=!this._dataBinary;i&&!n&&(t=t.pipe(new o.Utf8EncodeWorker)),!i&&n&&(t=t.pipe(new o.Utf8DecodeWorker))}catch(e){(t=new f("error")).error(e)}return new s(t,r,"")},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||"nodebuffer").toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof a&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new o.Utf8EncodeWorker)),a.createWorkerFrom(r,e,t)},_decompressWorker:function(){return this._data instanceof a?this._data.getContentWorker():this._data instanceof f?this._data:new i(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],d=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},h=0;h<u.length;h++)n.prototype[u[h]]=d;t.exports=n},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,d,t){(function(t){"use strict";var r,n,e=t.MutationObserver||t.WebKitMutationObserver;if(e){var i=0,s=new e(u),o=t.document.createTextNode("");s.observe(o,{characterData:!0}),r=function(){o.data=i=++i%2}}else if(t.setImmediate||void 0===t.MessageChannel)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){u(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(u,0)};else{var a=new t.MessageChannel;a.port1.onmessage=u,r=function(){a.port2.postMessage(0)}}var f=[];function u(){var e,t;n=!0;for(var r=f.length;r;){for(t=f,f=[],e=-1;++e<r;)t[e]();r=f.length}n=!1}d.exports=function(e){1!==f.push(e)||n||r()}}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(e,t,r){"use strict";var i=e("immediate");function u(){}var d={},s=["REJECTED"],o=["FULFILLED"],n=["PENDING"];function a(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=n,this.queue=[],this.outcome=void 0,e!==u&&c(this,e)}function f(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function h(t,r,n){i(function(){var e;try{e=r(n)}catch(e){return d.reject(t,e)}e===t?d.reject(t,new TypeError("Cannot resolve promise with itself")):d.resolve(t,e)})}function l(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function c(t,e){var r=!1;function n(e){r||(r=!0,d.reject(t,e))}function i(e){r||(r=!0,d.resolve(t,e))}var s=p(function(){e(i,n)});"error"===s.status&&n(s.value)}function p(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}(t.exports=a).prototype.finally=function(t){if("function"!=typeof t)return this;var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},a.prototype.catch=function(e){return this.then(null,e)},a.prototype.then=function(e,t){if("function"!=typeof e&&this.state===o||"function"!=typeof t&&this.state===s)return this;var r=new this.constructor(u);return this.state!==n?h(r,this.state===o?e:t,this.outcome):this.queue.push(new f(r,e,t)),r},f.prototype.callFulfilled=function(e){d.resolve(this.promise,e)},f.prototype.otherCallFulfilled=function(e){h(this.promise,this.onFulfilled,e)},f.prototype.callRejected=function(e){d.reject(this.promise,e)},f.prototype.otherCallRejected=function(e){h(this.promise,this.onRejected,e)},d.resolve=function(e,t){var r=p(l,t);if("error"===r.status)return d.reject(e,r.value);var n=r.value;if(n)c(e,n);else{e.state=o,e.outcome=t;for(var i=-1,s=e.queue.length;++i<s;)e.queue[i].callFulfilled(t)}return e},d.reject=function(e,t){e.state=s,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},a.resolve=function(e){return e instanceof this?e:d.resolve(new this(u),e)},a.reject=function(e){var t=new this(u);return d.reject(t,e)},a.all=function(e){var r=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);for(var s=new Array(n),o=0,t=-1,a=new this(u);++t<n;)f(e[t],t);return a;function f(e,t){r.resolve(e).then(function(e){s[t]=e,++o!==n||i||(i=!0,d.resolve(a,s))},function(e){i||(i=!0,d.reject(a,e))})}},a.race=function(e){if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var t=e.length,r=!1;if(!t)return this.resolve([]);for(var n,i=-1,s=new this(u);++i<t;)n=e[i],this.resolve(n).then(function(e){r||(r=!0,d.resolve(s,e))},function(e){r||(r=!0,d.reject(s,e))});return s}},{immediate:36}],38:[function(e,t,r){"use strict";var n={};(0,e("./lib/utils/common").assign)(n,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),t.exports=n},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,r){"use strict";var o=e("./zlib/deflate"),a=e("./utils/common"),f=e("./utils/strings"),i=e("./zlib/messages"),s=e("./zlib/zstream"),u=Object.prototype.toString,d=0,h=-1,l=0,c=8;function p(e){if(!(this instanceof p))return new p(e);this.options=a.assign({level:h,method:c,chunkSize:16384,windowBits:15,memLevel:8,strategy:l,to:""},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=o.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(r!==d)throw new Error(i[r]);if(t.header&&o.deflateSetHeader(this.strm,t.header),t.dictionary){var n;if(n="string"==typeof t.dictionary?f.string2buf(t.dictionary):"[object ArrayBuffer]"===u.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(r=o.deflateSetDictionary(this.strm,n))!==d)throw new Error(i[r]);this._dict_set=!0}}function n(e,t){var r=new p(t);if(r.push(e,!0),r.err)throw r.msg||i[r.err];return r.result}p.prototype.push=function(e,t){var r,n,i=this.strm,s=this.options.chunkSize;if(this.ended)return!1;n=t===~~t?t:!0===t?4:0,"string"==typeof e?i.input=f.string2buf(e):"[object ArrayBuffer]"===u.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;do{if(0===i.avail_out&&(i.output=new a.Buf8(s),i.next_out=0,i.avail_out=s),1!==(r=o.deflate(i,n))&&r!==d)return this.onEnd(r),!(this.ended=!0);0!==i.avail_out&&(0!==i.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(f.buf2binstring(a.shrinkBuf(i.output,i.next_out))):this.onData(a.shrinkBuf(i.output,i.next_out)))}while((0<i.avail_in||0===i.avail_out)&&1!==r);return 4===n?(r=o.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===d):2!==n||(this.onEnd(d),!(i.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===d&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=a.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Deflate=p,r.deflate=n,r.deflateRaw=function(e,t){return(t=t||{}).raw=!0,n(e,t)},r.gzip=function(e,t){return(t=t||{}).gzip=!0,n(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,r){"use strict";var l=e("./zlib/inflate"),c=e("./utils/common"),p=e("./utils/strings"),m=e("./zlib/constants"),n=e("./zlib/messages"),i=e("./zlib/zstream"),s=e("./zlib/gzheader"),_=Object.prototype.toString;function o(e){if(!(this instanceof o))return new o(e);this.options=c.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var r=l.inflateInit2(this.strm,t.windowBits);if(r!==m.Z_OK)throw new Error(n[r]);this.header=new s,l.inflateGetHeader(this.strm,this.header)}function a(e,t){var r=new o(t);if(r.push(e,!0),r.err)throw r.msg||n[r.err];return r.result}o.prototype.push=function(e,t){var r,n,i,s,o,a,f=this.strm,u=this.options.chunkSize,d=this.options.dictionary,h=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof e?f.input=p.binstring2buf(e):"[object ArrayBuffer]"===_.call(e)?f.input=new Uint8Array(e):f.input=e,f.next_in=0,f.avail_in=f.input.length;do{if(0===f.avail_out&&(f.output=new c.Buf8(u),f.next_out=0,f.avail_out=u),(r=l.inflate(f,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&d&&(a="string"==typeof d?p.string2buf(d):"[object ArrayBuffer]"===_.call(d)?new Uint8Array(d):d,r=l.inflateSetDictionary(this.strm,a)),r===m.Z_BUF_ERROR&&!0===h&&(r=m.Z_OK,h=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);f.next_out&&(0!==f.avail_out&&r!==m.Z_STREAM_END&&(0!==f.avail_in||n!==m.Z_FINISH&&n!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(i=p.utf8border(f.output,f.next_out),s=f.next_out-i,o=p.buf2string(f.output,i),f.next_out=s,f.avail_out=u-s,s&&c.arraySet(f.output,f.output,i,s,0),this.onData(o)):this.onData(c.shrinkBuf(f.output,f.next_out)))),0===f.avail_in&&0===f.avail_out&&(h=!0)}while((0<f.avail_in||0===f.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(n=m.Z_FINISH),n===m.Z_FINISH?(r=l.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):n!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(f.avail_out=0))},o.prototype.onData=function(e){this.chunks.push(e)},o.prototype.onEnd=function(e){e===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=c.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Inflate=o,r.inflate=a,r.inflateRaw=function(e,t){return(t=t||{}).raw=!0,a(e,t)},r.ungzip=a},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)r.hasOwnProperty(n)&&(e[n]=r[n])}}return e},r.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){var t,r,n,i,s,o;for(t=n=0,r=e.length;t<r;t++)n+=e[t].length;for(o=new Uint8Array(n),t=i=0,r=e.length;t<r;t++)s=e[t],o.set(s,i),i+=s.length;return o}},s={arraySet:function(e,t,r,n,i){for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){return[].concat.apply([],e)}};r.setTyped=function(e){e?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,i)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(n)},{}],42:[function(e,t,r){"use strict";var f=e("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){s=!1}for(var u=new f.Buf8(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function d(e,t){if(t<65537&&(e.subarray&&s||!e.subarray&&i))return String.fromCharCode.apply(null,f.shrinkBuf(e,t));for(var r="",n=0;n<t;n++)r+=String.fromCharCode(e[n]);return r}u[254]=u[254]=1,r.string2buf=function(e){var t,r,n,i,s,o=e.length,a=0;for(i=0;i<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<o&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),a+=r<128?1:r<2048?2:r<65536?3:4;for(t=new f.Buf8(a),i=s=0;s<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<o&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t},r.buf2binstring=function(e){return d(e,e.length)},r.binstring2buf=function(e){for(var t=new f.Buf8(e.length),r=0,n=t.length;r<n;r++)t[r]=e.charCodeAt(r);return t},r.buf2string=function(e,t){var r,n,i,s,o=t||e.length,a=new Array(2*o);for(r=n=0;r<o;)if((i=e[r++])<128)a[n++]=i;else if(4<(s=u[i]))a[n++]=65533,r+=s-1;else{for(i&=2===s?31:3===s?15:7;1<s&&r<o;)i=i<<6|63&e[r++],s--;1<s?a[n++]=65533:i<65536?a[n++]=i:(i-=65536,a[n++]=55296|i>>10&1023,a[n++]=56320|1023&i)}return d(a,n)},r.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}},{"./common":41}],43:[function(e,t,r){"use strict";t.exports=function(e,t,r,n){for(var i=65535&e|0,s=e>>>16&65535|0,o=0;0!==r;){for(r-=o=2e3<r?2e3:r;s=s+(i=i+t[n++]|0)|0,--o;);i%=65521,s%=65521}return i|s<<16|0}},{}],44:[function(e,t,r){"use strict";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,r){"use strict";var a=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t,r,n){var i=a,s=n+r;e^=-1;for(var o=n;o<s;o++)e=e>>>8^i[255&(e^t[o])];return-1^e}},{}],46:[function(e,t,r){"use strict";var f,l=e("../utils/common"),u=e("./trees"),c=e("./adler32"),p=e("./crc32"),n=e("./messages"),d=0,h=0,m=-2,i=2,_=8,s=286,o=30,a=19,w=2*s+1,v=15,g=3,y=258,b=y+g+1,k=42,x=113;function S(e,t){return e.msg=n[t],t}function E(e){return(e<<1)-(4<e?9:0)}function z(e){for(var t=e.length;0<=--t;)e[t]=0}function C(e){var t=e.state,r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(l.arraySet(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0))}function A(e,t){u._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,C(e.strm)}function O(e,t){e.pending_buf[e.pending++]=t}function I(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function D(e,t){var r,n,i=e.max_chain_length,s=e.strstart,o=e.prev_length,a=e.nice_match,f=e.strstart>e.w_size-b?e.strstart-(e.w_size-b):0,u=e.window,d=e.w_mask,h=e.prev,l=e.strstart+y,c=u[s+o-1],p=u[s+o];e.prev_length>=e.good_match&&(i>>=2),a>e.lookahead&&(a=e.lookahead);do{if(u[(r=t)+o]===p&&u[r+o-1]===c&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<l);if(n=y-(l-s),s=l-y,o<n){if(e.match_start=t,a<=(o=n))break;c=u[s+o-1],p=u[s+o]}}}while((t=h[t&d])>f&&0!=--i);return o<=e.lookahead?o:e.lookahead}function B(e){var t,r,n,i,s,o,a,f,u,d,h=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=h+(h-b)){for(l.arraySet(e.window,e.window,h,h,0),e.match_start-=h,e.strstart-=h,e.block_start-=h,t=r=e.hash_size;n=e.head[--t],e.head[t]=h<=n?n-h:0,--r;);for(t=r=h;n=e.prev[--t],e.prev[t]=h<=n?n-h:0,--r;);i+=h}if(0===e.strm.avail_in)break;if(o=e.strm,a=e.window,f=e.strstart+e.lookahead,d=void 0,(u=i)<(d=o.avail_in)&&(d=u),r=0===d?0:(o.avail_in-=d,l.arraySet(a,o.input,o.next_in,d,f),1===o.state.wrap?o.adler=c(o.adler,a,d,f):2===o.state.wrap&&(o.adler=p(o.adler,a,d,f)),o.next_in+=d,o.total_in+=d,d),e.lookahead+=r,e.lookahead+e.insert>=g)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+g-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<g)););}while(e.lookahead<b&&0!==e.strm.avail_in)}function T(e,t){for(var r,n;;){if(e.lookahead<b){if(B(e),e.lookahead<b&&t===d)return 1;if(0===e.lookahead)break}if(r=0,e.lookahead>=g&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+g-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-b&&(e.match_length=D(e,r)),e.match_length>=g)if(n=u._tr_tally(e,e.strstart-e.match_start,e.match_length-g),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=g){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+g-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,0!=--e.match_length;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(A(e,!1),0===e.strm.avail_out))return 1}return e.insert=e.strstart<g-1?e.strstart:g-1,4===t?(A(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(A(e,!1),0===e.strm.avail_out)?1:2}function R(e,t){for(var r,n,i;;){if(e.lookahead<b){if(B(e),e.lookahead<b&&t===d)return 1;if(0===e.lookahead)break}if(r=0,e.lookahead>=g&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+g-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=g-1,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-b&&(e.match_length=D(e,r),e.match_length<=5&&(1===e.strategy||e.match_length===g&&4096<e.strstart-e.match_start)&&(e.match_length=g-1)),e.prev_length>=g&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-g,n=u._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-g),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+g-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!=--e.prev_length;);if(e.match_available=0,e.match_length=g-1,e.strstart++,n&&(A(e,!1),0===e.strm.avail_out))return 1}else if(e.match_available){if((n=u._tr_tally(e,0,e.window[e.strstart-1]))&&A(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return 1}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=u._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<g-1?e.strstart:g-1,4===t?(A(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(A(e,!1),0===e.strm.avail_out)?1:2}function F(e,t,r,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=n,this.func=i}function N(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=_,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new l.Buf16(2*w),this.dyn_dtree=new l.Buf16(2*(2*o+1)),this.bl_tree=new l.Buf16(2*(2*a+1)),z(this.dyn_ltree),z(this.dyn_dtree),z(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new l.Buf16(v+1),this.heap=new l.Buf16(2*s+1),z(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new l.Buf16(2*s+1),z(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function U(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=i,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?k:x,e.adler=2===t.wrap?0:1,t.last_flush=d,u._tr_init(t),h):S(e,m)}function L(e){var t,r=U(e);return r===h&&((t=e.state).window_size=2*t.w_size,z(t.head),t.max_lazy_match=f[t.level].max_lazy,t.good_match=f[t.level].good_length,t.nice_match=f[t.level].nice_length,t.max_chain_length=f[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=g-1,t.match_available=0,t.ins_h=0),r}function P(e,t,r,n,i,s){if(!e)return m;var o=1;if(-1===t&&(t=6),n<0?(o=0,n=-n):15<n&&(o=2,n-=16),i<1||9<i||r!==_||n<8||15<n||t<0||9<t||s<0||4<s)return S(e,m);8===n&&(n=9);var a=new N;return(e.state=a).strm=e,a.wrap=o,a.gzhead=null,a.w_bits=n,a.w_size=1<<a.w_bits,a.w_mask=a.w_size-1,a.hash_bits=i+7,a.hash_size=1<<a.hash_bits,a.hash_mask=a.hash_size-1,a.hash_shift=~~((a.hash_bits+g-1)/g),a.window=new l.Buf8(2*a.w_size),a.head=new l.Buf16(a.hash_size),a.prev=new l.Buf16(a.w_size),a.lit_bufsize=1<<i+6,a.pending_buf_size=4*a.lit_bufsize,a.pending_buf=new l.Buf8(a.pending_buf_size),a.d_buf=1*a.lit_bufsize,a.l_buf=3*a.lit_bufsize,a.level=t,a.strategy=s,a.method=r,L(e)}f=[new F(0,0,0,0,function(e,t){var r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(B(e),0===e.lookahead&&t===d)return 1;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+r;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,A(e,!1),0===e.strm.avail_out))return 1;if(e.strstart-e.block_start>=e.w_size-b&&(A(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(A(e,!0),0===e.strm.avail_out?3:4):(e.strstart>e.block_start&&(A(e,!1),e.strm.avail_out),1)}),new F(4,4,8,4,T),new F(4,5,16,8,T),new F(4,6,32,32,T),new F(4,4,16,16,R),new F(8,16,32,32,R),new F(8,16,128,128,R),new F(8,32,128,256,R),new F(32,128,258,1024,R),new F(32,258,258,4096,R)],r.deflateInit=function(e,t){return P(e,t,_,15,8,0)},r.deflateInit2=P,r.deflateReset=L,r.deflateResetKeep=U,r.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?m:(e.state.gzhead=t,h):m},r.deflate=function(e,t){var r,n,i,s;if(!e||!e.state||5<t||t<0)return e?S(e,m):m;if(n=e.state,!e.output||!e.input&&0!==e.avail_in||666===n.status&&4!==t)return S(e,0===e.avail_out?-5:m);if(n.strm=e,r=n.last_flush,n.last_flush=t,n.status===k)if(2===n.wrap)e.adler=0,O(n,31),O(n,139),O(n,8),n.gzhead?(O(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),O(n,255&n.gzhead.time),O(n,n.gzhead.time>>8&255),O(n,n.gzhead.time>>16&255),O(n,n.gzhead.time>>24&255),O(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),O(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(O(n,255&n.gzhead.extra.length),O(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=p(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(O(n,0),O(n,0),O(n,0),O(n,0),O(n,0),O(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),O(n,3),n.status=x);else{var o=_+(n.w_bits-8<<4)<<8;o|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(o|=32),o+=31-o%31,n.status=x,I(n,o),0!==n.strstart&&(I(n,e.adler>>>16),I(n,65535&e.adler)),e.adler=1}if(69===n.status)if(n.gzhead.extra){for(i=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),C(e),i=n.pending,n.pending!==n.pending_buf_size));)O(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),C(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0,O(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),C(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0,O(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&C(e),n.pending+2<=n.pending_buf_size&&(O(n,255&e.adler),O(n,e.adler>>8&255),e.adler=0,n.status=x)):n.status=x),0!==n.pending){if(C(e),0===e.avail_out)return n.last_flush=-1,h}else if(0===e.avail_in&&E(t)<=E(r)&&4!==t)return S(e,-5);if(666===n.status&&0!==e.avail_in)return S(e,-5);if(0!==e.avail_in||0!==n.lookahead||t!==d&&666!==n.status){var a=2===n.strategy?function(e,t){for(var r;;){if(0===e.lookahead&&(B(e),0===e.lookahead)){if(t===d)return 1;break}if(e.match_length=0,r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(A(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(A(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(A(e,!1),0===e.strm.avail_out)?1:2}(n,t):3===n.strategy?function(e,t){for(var r,n,i,s,o=e.window;;){if(e.lookahead<=y){if(B(e),e.lookahead<=y&&t===d)return 1;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=g&&0<e.strstart&&(n=o[i=e.strstart-1])===o[++i]&&n===o[++i]&&n===o[++i]){s=e.strstart+y;do{}while(n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&i<s);e.match_length=y-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=g?(r=u._tr_tally(e,1,e.match_length-g),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(A(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(A(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(A(e,!1),0===e.strm.avail_out)?1:2}(n,t):f[n.level].func(n,t);if(3!==a&&4!==a||(n.status=666),1===a||3===a)return 0===e.avail_out&&(n.last_flush=-1),h;if(2===a&&(1===t?u._tr_align(n):5!==t&&(u._tr_stored_block(n,0,0,!1),3===t&&(z(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),C(e),0===e.avail_out))return n.last_flush=-1,h}return 4!==t?h:n.wrap<=0?1:(2===n.wrap?(O(n,255&e.adler),O(n,e.adler>>8&255),O(n,e.adler>>16&255),O(n,e.adler>>24&255),O(n,255&e.total_in),O(n,e.total_in>>8&255),O(n,e.total_in>>16&255),O(n,e.total_in>>24&255)):(I(n,e.adler>>>16),I(n,65535&e.adler)),C(e),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?h:1)},r.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==k&&69!==t&&73!==t&&91!==t&&103!==t&&t!==x&&666!==t?S(e,m):(e.state=null,t===x?S(e,-3):h):m},r.deflateSetDictionary=function(e,t){var r,n,i,s,o,a,f,u,d=t.length;if(!e||!e.state)return m;if(2===(s=(r=e.state).wrap)||1===s&&r.status!==k||r.lookahead)return m;for(1===s&&(e.adler=c(e.adler,t,d,0)),r.wrap=0,d>=r.w_size&&(0===s&&(z(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new l.Buf8(r.w_size),l.arraySet(u,t,d-r.w_size,r.w_size,0),t=u,d=r.w_size),o=e.avail_in,a=e.next_in,f=e.input,e.avail_in=d,e.next_in=0,e.input=t,B(r);r.lookahead>=g;){for(n=r.strstart,i=r.lookahead-(g-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[n+g-1])&r.hash_mask,r.prev[n&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=n,n++,--i;);r.strstart=n,r.lookahead=g-1,B(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=g-1,r.match_available=0,e.next_in=a,e.input=f,e.avail_in=o,r.wrap=s,h},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,r){"use strict";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,t,r){"use strict";t.exports=function(e,t){var r,n,i,s,o,a,f,u,d,h,l,c,p,m,_,w,v,g,y,b,k,x,S,E,z;r=e.state,n=e.next_in,E=e.input,i=n+(e.avail_in-5),s=e.next_out,z=e.output,o=s-(t-e.avail_out),a=s+(e.avail_out-257),f=r.dmax,u=r.wsize,d=r.whave,h=r.wnext,l=r.window,c=r.hold,p=r.bits,m=r.lencode,_=r.distcode,w=(1<<r.lenbits)-1,v=(1<<r.distbits)-1;e:do{p<15&&(c+=E[n++]<<p,p+=8,c+=E[n++]<<p,p+=8),g=m[c&w];t:for(;;){if(c>>>=y=g>>>24,p-=y,0==(y=g>>>16&255))z[s++]=65535&g;else{if(!(16&y)){if(0==(64&y)){g=m[(65535&g)+(c&(1<<y)-1)];continue t}if(32&y){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}b=65535&g,(y&=15)&&(p<y&&(c+=E[n++]<<p,p+=8),b+=c&(1<<y)-1,c>>>=y,p-=y),p<15&&(c+=E[n++]<<p,p+=8,c+=E[n++]<<p,p+=8),g=_[c&v];r:for(;;){if(c>>>=y=g>>>24,p-=y,!(16&(y=g>>>16&255))){if(0==(64&y)){g=_[(65535&g)+(c&(1<<y)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&g,p<(y&=15)&&(c+=E[n++]<<p,(p+=8)<y&&(c+=E[n++]<<p,p+=8)),f<(k+=c&(1<<y)-1)){e.msg="invalid distance too far back",r.mode=30;break e}if(c>>>=y,p-=y,(y=s-o)<k){if(d<(y=k-y)&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=l,(x=0)===h){if(x+=u-y,y<b){for(b-=y;z[s++]=l[x++],--y;);x=s-k,S=z}}else if(h<y){if(x+=u+h-y,(y-=h)<b){for(b-=y;z[s++]=l[x++],--y;);if(x=0,h<b){for(b-=y=h;z[s++]=l[x++],--y;);x=s-k,S=z}}}else if(x+=h-y,y<b){for(b-=y;z[s++]=l[x++],--y;);x=s-k,S=z}for(;2<b;)z[s++]=S[x++],z[s++]=S[x++],z[s++]=S[x++],b-=3;b&&(z[s++]=S[x++],1<b&&(z[s++]=S[x++]))}else{for(x=s-k;z[s++]=z[x++],z[s++]=z[x++],z[s++]=z[x++],2<(b-=3););b&&(z[s++]=z[x++],1<b&&(z[s++]=z[x++]))}break}}break}}while(n<i&&s<a);n-=b=p>>3,c&=(1<<(p-=b<<3))-1,e.next_in=n,e.next_out=s,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=s<a?a-s+257:257-(s-a),r.hold=c,r.bits=p}},{}],49:[function(e,t,r){"use strict";var O=e("../utils/common"),I=e("./adler32"),D=e("./crc32"),B=e("./inffast"),T=e("./inftrees"),R=1,F=2,N=0,U=-2,L=1,n=852,i=592;function P(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new O.Buf16(320),this.work=new O.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function o(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=L,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new O.Buf32(n),t.distcode=t.distdyn=new O.Buf32(i),t.sane=1,t.back=-1,N):U}function a(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,o(e)):U}function f(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,a(e))):U}function u(e,t){var r,n;return e?(n=new s,(e.state=n).window=null,(r=f(e,t))!==N&&(e.state=null),r):U}var d,h,l=!0;function j(e){if(l){var t;for(d=new O.Buf32(512),h=new O.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(T(R,e.lens,0,288,d,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;T(F,e.lens,0,32,h,0,e.work,{bits:5}),l=!1}e.lencode=d,e.lenbits=9,e.distcode=h,e.distbits=5}function Z(e,t,r,n){var i,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new O.Buf8(s.wsize)),n>=s.wsize?(O.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(n<(i=s.wsize-s.wnext)&&(i=n),O.arraySet(s.window,t,r-n,i,s.wnext),(n-=i)?(O.arraySet(s.window,t,r-n,n,0),s.wnext=n,s.whave=s.wsize):(s.wnext+=i,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=i))),0}r.inflateReset=a,r.inflateReset2=f,r.inflateResetKeep=o,r.inflateInit=function(e){return u(e,15)},r.inflateInit2=u,r.inflate=function(e,t){var r,n,i,s,o,a,f,u,d,h,l,c,p,m,_,w,v,g,y,b,k,x,S,E,z=0,C=new O.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(r=e.state).mode&&(r.mode=13),o=e.next_out,i=e.output,f=e.avail_out,s=e.next_in,n=e.input,a=e.avail_in,u=r.hold,d=r.bits,h=a,l=f,x=N;e:for(;;)switch(r.mode){case L:if(0===r.wrap){r.mode=13;break}for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(2&r.wrap&&35615===u){C[r.check=0]=255&u,C[1]=u>>>8&255,r.check=D(r.check,C,2,0),d=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(d-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,d=u=0;break;case 2:for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(C[0]=255&u,C[1]=u>>>8&255,r.check=D(r.check,C,2,0)),d=u=0,r.mode=3;case 3:for(;d<32;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.head&&(r.head.time=u),512&r.flags&&(C[0]=255&u,C[1]=u>>>8&255,C[2]=u>>>16&255,C[3]=u>>>24&255,r.check=D(r.check,C,4,0)),d=u=0,r.mode=4;case 4:for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(C[0]=255&u,C[1]=u>>>8&255,r.check=D(r.check,C,2,0)),d=u=0,r.mode=5;case 5:if(1024&r.flags){for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(C[0]=255&u,C[1]=u>>>8&255,r.check=D(r.check,C,2,0)),d=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(a<(c=r.length)&&(c=a),c&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),O.arraySet(r.head.extra,n,s,c,k)),512&r.flags&&(r.check=D(r.check,n,c,s)),a-=c,s+=c,r.length-=c),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===a)break e;for(c=0;k=n[s+c++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&c<a;);if(512&r.flags&&(r.check=D(r.check,n,c,s)),a-=c,s+=c,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===a)break e;for(c=0;k=n[s+c++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&c<a;);if(512&r.flags&&(r.check=D(r.check,n,c,s)),a-=c,s+=c,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}d=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;d<32;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}e.adler=r.check=P(u),d=u=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=o,e.avail_out=f,e.next_in=s,e.avail_in=a,r.hold=u,r.bits=d,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&d,d-=7&d,r.mode=27;break}for(;d<3;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}switch(r.last=1&u,d-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==t)break;u>>>=2,d-=2;break e;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}u>>>=2,d-=2;break;case 14:for(u>>>=7&d,d-=7&d;d<32;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,d=u=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(c=r.length){if(a<c&&(c=a),f<c&&(c=f),0===c)break e;O.arraySet(i,n,s,c,o),a-=c,s+=c,f-=c,o+=c,r.length-=c;break}r.mode=12;break;case 17:for(;d<14;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(r.nlen=257+(31&u),u>>>=5,d-=5,r.ndist=1+(31&u),u>>>=5,d-=5,r.ncode=4+(15&u),u>>>=4,d-=4,286<r.nlen||30<r.ndist){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;d<3;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.lens[A[r.have++]]=7&u,u>>>=3,d-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;w=(z=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,v=65535&z,!((_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(v<16)u>>>=_,d-=_,r.lens[r.have++]=v;else{if(16===v){for(E=_+2;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(u>>>=_,d-=_,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],c=3+(3&u),u>>>=2,d-=2}else if(17===v){for(E=_+3;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}d-=_,k=0,c=3+(7&(u>>>=_)),u>>>=3,d-=3}else{for(E=_+7;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}d-=_,k=0,c=11+(127&(u>>>=_)),u>>>=7,d-=7}if(r.have+c>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;c--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(R,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(6<=a&&258<=f){e.next_out=o,e.avail_out=f,e.next_in=s,e.avail_in=a,r.hold=u,r.bits=d,B(e,l),o=e.next_out,i=e.output,f=e.avail_out,s=e.next_in,n=e.input,a=e.avail_in,u=r.hold,d=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;w=(z=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,v=65535&z,!((_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(w&&0==(240&w)){for(g=_,y=w,b=v;w=(z=r.lencode[b+((u&(1<<g+y)-1)>>g)])>>>16&255,v=65535&z,!(g+(_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}u>>>=g,d-=g,r.back+=g}if(u>>>=_,d-=_,r.back+=_,r.length=v,0===w){r.mode=26;break}if(32&w){r.back=-1,r.mode=12;break}if(64&w){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&w,r.mode=22;case 22:if(r.extra){for(E=r.extra;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,d-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;w=(z=r.distcode[u&(1<<r.distbits)-1])>>>16&255,v=65535&z,!((_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(0==(240&w)){for(g=_,y=w,b=v;w=(z=r.distcode[b+((u&(1<<g+y)-1)>>g)])>>>16&255,v=65535&z,!(g+(_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}u>>>=g,d-=g,r.back+=g}if(u>>>=_,d-=_,r.back+=_,64&w){e.msg="invalid distance code",r.mode=30;break}r.offset=v,r.extra=15&w,r.mode=24;case 24:if(r.extra){for(E=r.extra;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,d-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===f)break e;if(c=l-f,r.offset>c){if((c=r.offset-c)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}p=c>r.wnext?(c-=r.wnext,r.wsize-c):r.wnext-c,c>r.length&&(c=r.length),m=r.window}else m=i,p=o-r.offset,c=r.length;for(f<c&&(c=f),f-=c,r.length-=c;i[o++]=m[p++],--c;);0===r.length&&(r.mode=21);break;case 26:if(0===f)break e;i[o++]=r.length,f--,r.mode=21;break;case 27:if(r.wrap){for(;d<32;){if(0===a)break e;a--,u|=n[s++]<<d,d+=8}if(l-=f,e.total_out+=l,r.total+=l,l&&(e.adler=r.check=r.flags?D(r.check,i,l,o-l):I(r.check,i,l,o-l)),l=f,(r.flags?u:P(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}d=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;d<32;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}d=u=0}r.mode=29;case 29:x=1;break e;case 30:x=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=o,e.avail_out=f,e.next_in=s,e.avail_in=a,r.hold=u,r.bits=d,(r.wsize||l!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&Z(e,e.output,e.next_out,l-e.avail_out)?(r.mode=31,-4):(h-=e.avail_in,l-=e.avail_out,e.total_in+=h,e.total_out+=l,r.total+=l,r.wrap&&l&&(e.adler=r.check=r.flags?D(r.check,i,l,e.next_out-l):I(r.check,i,l,e.next_out-l)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==h&&0===l||4===t)&&x===N&&(x=-5),x)},r.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,N},r.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?U:((r.head=t).done=!1,N):U},r.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?U:11===r.mode&&I(1,t,n,0)!==r.check?-3:Z(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,r){"use strict";var R=e("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],L=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,r,n,i,s,o,a){var f,u,d,h,l,c,p,m,_,w=a.bits,v=0,g=0,y=0,b=0,k=0,x=0,S=0,E=0,z=0,C=0,A=null,O=0,I=new R.Buf16(16),D=new R.Buf16(16),B=null,T=0;for(v=0;v<=15;v++)I[v]=0;for(g=0;g<n;g++)I[t[r+g]]++;for(k=w,b=15;1<=b&&0===I[b];b--);if(b<k&&(k=b),0===b)return i[s++]=20971520,i[s++]=20971520,a.bits=1,0;for(y=1;y<b&&0===I[y];y++);for(k<y&&(k=y),v=E=1;v<=15;v++)if(E<<=1,(E-=I[v])<0)return-1;if(0<E&&(0===e||1!==b))return-1;for(D[1]=0,v=1;v<15;v++)D[v+1]=D[v]+I[v];for(g=0;g<n;g++)0!==t[r+g]&&(o[D[t[r+g]]++]=g);if(c=0===e?(A=B=o,19):1===e?(A=F,O-=257,B=N,T-=257,256):(A=U,B=L,-1),v=y,l=s,S=g=C=0,d=-1,h=(z=1<<(x=k))-1,1===e&&852<z||2===e&&592<z)return 1;for(;;){for(p=v-S,_=o[g]<c?(m=0,o[g]):o[g]>c?(m=B[T+o[g]],A[O+o[g]]):(m=96,0),f=1<<v-S,y=u=1<<x;i[l+(C>>S)+(u-=f)]=p<<24|m<<16|_|0,0!==u;);for(f=1<<v-1;C&f;)f>>=1;if(0!==f?(C&=f-1,C+=f):C=0,g++,0==--I[v]){if(v===b)break;v=t[r+o[g]]}if(k<v&&(C&h)!==d){for(0===S&&(S=k),l+=y,E=1<<(x=v-S);x+S<b&&!((E-=I[x+S])<=0);)x++,E<<=1;if(z+=1<<x,1===e&&852<z||2===e&&592<z)return 1;i[d=C&h]=k<<24|x<<16|l-s|0}}return 0!==C&&(i[l+C]=v-S<<24|64<<16|0),a.bits=k,0}},{"../utils/common":41}],51:[function(e,t,r){"use strict";t.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,t,r){"use strict";var a=e("../utils/common");function n(e){for(var t=e.length;0<=--t;)e[t]=0}var _=15,i=16,f=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],u=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],o=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],d=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],h=new Array(576);n(h);var l=new Array(60);n(l);var c=new Array(512);n(c);var p=new Array(256);n(p);var m=new Array(29);n(m);var w,v,g,y=new Array(30);function b(e,t,r,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function s(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function k(e){return e<256?c[e]:c[256+(e>>>7)]}function x(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function S(e,t,r){e.bi_valid>i-r?(e.bi_buf|=t<<e.bi_valid&65535,x(e,e.bi_buf),e.bi_buf=t>>i-e.bi_valid,e.bi_valid+=r-i):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r)}function E(e,t,r){S(e,r[2*t],r[2*t+1])}function z(e,t){for(var r=0;r|=1&e,e>>>=1,r<<=1,0<--t;);return r>>>1}function C(e,t,r){var n,i,s=new Array(_+1),o=0;for(n=1;n<=_;n++)s[n]=o=o+r[n-1]<<1;for(i=0;i<=t;i++){var a=e[2*i+1];0!==a&&(e[2*i]=z(s[a]++,a))}}function A(e){var t;for(t=0;t<286;t++)e.dyn_ltree[2*t]=0;for(t=0;t<30;t++)e.dyn_dtree[2*t]=0;for(t=0;t<19;t++)e.bl_tree[2*t]=0;e.dyn_ltree[512]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function O(e){8<e.bi_valid?x(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function I(e,t,r,n){var i=2*t,s=2*r;return e[i]<e[s]||e[i]===e[s]&&n[t]<=n[r]}function D(e,t,r){for(var n=e.heap[r],i=r<<1;i<=e.heap_len&&(i<e.heap_len&&I(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!I(t,n,e.heap[i],e.depth));)e.heap[r]=e.heap[i],r=i,i<<=1;e.heap[r]=n}function B(e,t,r){var n,i,s,o,a=0;if(0!==e.last_lit)for(;n=e.pending_buf[e.d_buf+2*a]<<8|e.pending_buf[e.d_buf+2*a+1],i=e.pending_buf[e.l_buf+a],a++,0===n?E(e,i,t):(E(e,(s=p[i])+256+1,t),0!==(o=f[s])&&S(e,i-=m[s],o),E(e,s=k(--n),r),0!==(o=u[s])&&S(e,n-=y[s],o)),a<e.last_lit;);E(e,256,t)}function T(e,t){var r,n,i,s=t.dyn_tree,o=t.stat_desc.static_tree,a=t.stat_desc.has_stree,f=t.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=573,r=0;r<f;r++)0!==s[2*r]?(e.heap[++e.heap_len]=u=r,e.depth[r]=0):s[2*r+1]=0;for(;e.heap_len<2;)s[2*(i=e.heap[++e.heap_len]=u<2?++u:0)]=1,e.depth[i]=0,e.opt_len--,a&&(e.static_len-=o[2*i+1]);for(t.max_code=u,r=e.heap_len>>1;1<=r;r--)D(e,s,r);for(i=f;r=e.heap[1],e.heap[1]=e.heap[e.heap_len--],D(e,s,1),n=e.heap[1],e.heap[--e.heap_max]=r,e.heap[--e.heap_max]=n,s[2*i]=s[2*r]+s[2*n],e.depth[i]=(e.depth[r]>=e.depth[n]?e.depth[r]:e.depth[n])+1,s[2*r+1]=s[2*n+1]=i,e.heap[1]=i++,D(e,s,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var r,n,i,s,o,a,f=t.dyn_tree,u=t.max_code,d=t.stat_desc.static_tree,h=t.stat_desc.has_stree,l=t.stat_desc.extra_bits,c=t.stat_desc.extra_base,p=t.stat_desc.max_length,m=0;for(s=0;s<=_;s++)e.bl_count[s]=0;for(f[2*e.heap[e.heap_max]+1]=0,r=e.heap_max+1;r<573;r++)p<(s=f[2*f[2*(n=e.heap[r])+1]+1]+1)&&(s=p,m++),f[2*n+1]=s,u<n||(e.bl_count[s]++,o=0,c<=n&&(o=l[n-c]),a=f[2*n],e.opt_len+=a*(s+o),h&&(e.static_len+=a*(d[2*n+1]+o)));if(0!==m){do{for(s=p-1;0===e.bl_count[s];)s--;e.bl_count[s]--,e.bl_count[s+1]+=2,e.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(n=e.bl_count[s];0!==n;)u<(i=e.heap[--r])||(f[2*i+1]!==s&&(e.opt_len+=(s-f[2*i+1])*f[2*i],f[2*i+1]=s),n--)}}(e,t),C(s,u,e.bl_count)}function R(e,t,r){var n,i,s=-1,o=t[1],a=0,f=7,u=4;for(0===o&&(f=138,u=3),t[2*(r+1)+1]=65535,n=0;n<=r;n++)i=o,o=t[2*(n+1)+1],++a<f&&i===o||(a<u?e.bl_tree[2*i]+=a:0!==i?(i!==s&&e.bl_tree[2*i]++,e.bl_tree[32]++):a<=10?e.bl_tree[34]++:e.bl_tree[36]++,s=i,u=(a=0)===o?(f=138,3):i===o?(f=6,3):(f=7,4))}function F(e,t,r){var n,i,s=-1,o=t[1],a=0,f=7,u=4;for(0===o&&(f=138,u=3),n=0;n<=r;n++)if(i=o,o=t[2*(n+1)+1],!(++a<f&&i===o)){if(a<u)for(;E(e,i,e.bl_tree),0!=--a;);else 0!==i?(i!==s&&(E(e,i,e.bl_tree),a--),E(e,16,e.bl_tree),S(e,a-3,2)):a<=10?(E(e,17,e.bl_tree),S(e,a-3,3)):(E(e,18,e.bl_tree),S(e,a-11,7));s=i,u=(a=0)===o?(f=138,3):i===o?(f=6,3):(f=7,4)}}n(y);var N=!1;function U(e,t,r,n){var i,s,o;S(e,0+(n?1:0),3),s=t,o=r,O(i=e),x(i,o),x(i,~o),a.arraySet(i.pending_buf,i.window,s,o,i.pending),i.pending+=o}r._tr_init=function(e){N||(function(){var e,t,r,n,i,s=new Array(_+1);for(n=r=0;n<28;n++)for(m[n]=r,e=0;e<1<<f[n];e++)p[r++]=n;for(p[r-1]=n,n=i=0;n<16;n++)for(y[n]=i,e=0;e<1<<u[n];e++)c[i++]=n;for(i>>=7;n<30;n++)for(y[n]=i<<7,e=0;e<1<<u[n]-7;e++)c[256+i++]=n;for(t=0;t<=_;t++)s[t]=0;for(e=0;e<=143;)h[2*e+1]=8,e++,s[8]++;for(;e<=255;)h[2*e+1]=9,e++,s[9]++;for(;e<=279;)h[2*e+1]=7,e++,s[7]++;for(;e<=287;)h[2*e+1]=8,e++,s[8]++;for(C(h,287,s),e=0;e<30;e++)l[2*e+1]=5,l[2*e]=z(e,5);w=new b(h,f,257,286,_),v=new b(l,u,0,30,_),g=new b(new Array(0),o,0,19,7)}(),N=!0),e.l_desc=new s(e.dyn_ltree,w),e.d_desc=new s(e.dyn_dtree,v),e.bl_desc=new s(e.bl_tree,g),e.bi_buf=0,e.bi_valid=0,A(e)},r._tr_stored_block=U,r._tr_flush_block=function(e,t,r,n){var i,s,o=0;0<e.level?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return 0;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return 1;for(t=32;t<256;t++)if(0!==e.dyn_ltree[2*t])return 1;return 0}(e)),T(e,e.l_desc),T(e,e.d_desc),o=function(e){var t;for(R(e,e.dyn_ltree,e.l_desc.max_code),R(e,e.dyn_dtree,e.d_desc.max_code),T(e,e.bl_desc),t=18;3<=t&&0===e.bl_tree[2*d[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=i&&(i=s)):i=s=r+5,r+4<=i&&-1!==t?U(e,t,r,n):4===e.strategy||s===i?(S(e,2+(n?1:0),3),B(e,h,l)):(S(e,4+(n?1:0),3),function(e,t,r,n){var i;for(S(e,t-257,5),S(e,r-1,5),S(e,n-4,4),i=0;i<n;i++)S(e,e.bl_tree[2*d[i]+1],3);F(e,e.dyn_ltree,t-1),F(e,e.dyn_dtree,r-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,o+1),B(e,e.dyn_ltree,e.dyn_dtree)),A(e),n&&O(e)},r._tr_tally=function(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(p[r]+256+1)]++,e.dyn_dtree[2*k(t)]++),e.last_lit===e.lit_bufsize-1},r._tr_align=function(e){var t;S(e,2,3),E(e,256,h),16===(t=e).bi_valid?(x(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):8<=t.bi_valid&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}},{"../utils/common":41}],53:[function(e,t,r){"use strict";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,r){"use strict";t.exports="function"==typeof setImmediate?setImmediate:function(){var e=[].slice.apply(arguments);e.splice(1,0,0),setTimeout.apply(null,e)}},{}]},{},[10])(10)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)});
/*! pdfmake v0.2.2, @license MIT, @link http://pdfmake.org */
//# sourceMappingURL=pdfmake.min.js.map
this.pdfMake = this.pdfMake || {}; this.pdfMake.vfs = {
  "Roboto-Italic.ttf": "AAEAAAARAQAABAAQR0RFRqNLn+AAAd9EAAACWEdQT1PBrAqiAAHhnAAAZdhHU1VCgv9Z+gACR3QAABXQT1MvMpeDsUwAAAGYAAAAYGNtYXACVV9EAAAWNAAAEk5jdnQgO/gmfQAAOtwAAAD+ZnBnbagFhDIAACiEAAAPhmdhc3AACAAZAAHfOAAAAAxnbHlmrhTQbwAARfwAAZZaaGVhZAOALNYAAAEcAAAANmhoZWEMnBKKAAABVAAAACRobXR4DbbaVAAAAfgAABQ8bG9jYYbE574AADvcAAAKIG1heHAIvxDGAAABeAAAACBuYW1lOSJt3wAB3FgAAALAcG9zdP9hAGQAAd8YAAAAIHByZXB5WM7TAAA4DAAAAs4AAQAAAAMBBkejFUlfDzz1ABsIAAAAAADE8BEuAAAAANviz1z6N/3VCUMIcwACAAkAAgAAAAAAAAABAAAHbP4MAAAJA/o3/mwJQwgAAbMAAAAAAAAAAAAAAAAFDwABAAAFDwCpABUAdgAHAAIAEAAvAJoAAALmD3UAAwABAAQEiQGQAAUAAAWaBTMAAAEfBZoFMwAAA9EAZgIAAAACAAAAAAAAAAAA4AAC/1AAIFsAAAAgAAAAAEdPT0cAAQAA//0GAP4AAGYHmgIAIAABnwAAAAAEOgWwAAAAIAADA5YAZAAAAAAAAAAAAfcAAAH3AAACAABEAnwAyQTHAFIEXABJBa8AugTUADkBWwCsAqgAbQK0/5ADWABrBGcATAGH/48CJQAaAgwANAM0/5AEXABqBFwA+gRcABgEXAA1BFwABQRcAHIEXABtBFwAnQRcAEAEXACUAesAKQGu/5sD8gBCBEIAcAQPADsDqwClBvgAQQUQ/68E1gA7BQ0AcAUYADsEaQA7BEoAOwVJAHQFiQA7AhwASQRIAAcE3gA7BC4AOwbGADsFiQA7BVcAcwTlADsFVwBrBMgAOwScACkEoQCpBQgAYwTxAKUG4gDDBN3/1ASpAKgEpv/sAg8AAAMwAMACD/97Az4ATwOA/4ECZgDQBDkAMQRcAB8EEABGBGAARwQdAEUCswB1BFwAAwRGACAB4wAvAdv/EwPvACAB4wAvBs4AHgRJACAEbQBGBFz/1wRpAEYCoQAgBAEALgKKAEMERwBbA8IAbgXVAIAD2v/FA6z/qgPa/+4CoAA3AeUAIgKg/40FRwBpAeX/8QQ/AFAEg//zBYkAEgQUAEMB3f/4BML/2gM/ANoGGQBeA3kAwwOuAFYETACBBhoAXQOPAPgC5gDoBCYAJgLiAF0C4gBvAm8A1QRm/+YDzAB4AgcApQHt/8gC4gDgA4gAvwOtABEFuQC6Bg8AtQYTAJ4Drf/RB0H/gwQkACgFVwAgBJYAOQSdAB8GjgATBI0AXARvAEQEZgA6BHn/4ASjAEYFcAA2AewALwRSAC4ELgAjAhkAJAVgADUEZgAlB2YAVQcMAEcB7QA0BV0AUgKl/0cFVQBmBHAAQwVlAGMEzQBbAfX/CQQYAD8DpwEYA3MBKAOZAPgDUQEHAeMBDgKZAQECGv+uA6kA3gLlAMMCSP/pAAD9agAA/eoAAP0LAAD99AAA/NsAAPy6Af4BIwPtAPQCEQClBFEARAV5/7IFSABnBRf/xARvAAwFiQBEBG//2wWPAFYFXgCFBSkACgRjAEgEmf/xA+QAhQRmAEUEMAApBAUAigRmACUEawB1AoQAhARN/7gDzgBABKAAYARm/90ELQBKBGUASAQMAIcEPABoBXgAQAVvAE4GZABnBH4AUgQiAGcGGABoBdIAogU8AHMIUP/NCGMARAZRALQFiABCBO4ANgXW/4wHC/+rBJwAJQWJAEQFf//LBOEAlAX+AFsFrQBBBVAAywdNAEIHhABCBeMAigbAAEQE3gA2BTwAdgb6AEkE8f/pBEsARwRwADEDQgAuBK//jQXy/6cD8QAgBHsAMAQyADAEfP/IBcEAMQR6ADAEewAwA7sAYAWhAEkEmgAwBDkAeQZHADAGbAAlBNEAVgYQADEENwAxBC0AMgZWADEEQv+/BEYAIAQtAE4Glf/DBq8AMARwACAEewAwBtMAbgX9AE8ENgAvBvUASgXLAC0Erv+6BCb/ogbWAFsF3gBPBp4AJgW1ACoIwABJB5UALwQE/80Dvf/JBUgAZwRpAEME5ACtA+UAhQVIAGcEZgBDBssAdAX1AFIG0wBuBf0ATwUKAGkEJwBMBNgAQAAA/OcAAP0KAAD+FgAA/jsAAPo3AAD6TgXlAEQE0QAwBDYALwT0ADsEZ//XBEIANQN2ACUEwABEA+cAJQdx/6sGOv+nBXkARASeADAE4wA2BFwALgZaALwFWgB2BdsAOwS+ADAHkwA7BYgAJQf8AEIGvwAlBcEAawSvAFwE+//UBBT/xQb2AKwFNABXBZoAywR9AHkFRgDKBEkAlAVGABwGAACIBJoABATjADYEOQAuBdr/ywTT/8gFhwBEBGYAJQXtADsE0AAwByEAOwYYADEFXQBSBIQAPASE//0Env/5A5n/6QUQ/9QEKf/FBNEALgZiADEGsABIBiYArQUEAGgEKQCwA+kAoAeG/+AGRP/aB74APAZvACME0QBlA/4ATQWCAJsE+gB9BTwAaAXe/8sE1//IAwkA8wP/AAAH9AAAA/8AAAf0AAACrgAAAgQAAAFcAAAEZgAAAikAAAGfAAABAgAAANUAAAAAAAACLQAaAi0AGgUiAKYGGQCYA4r/XgGOALABjgCJAYz/lwGOANICyAC4AtAAlQKt/5QESAB3BG3/9gKeAKEDsQA4BTsAOAF0AFIHbwCWAlUAXQJVAAQDh//wAuIAZANHAH4Eg//zBiUACgZfADkIPwA7Bb4ACQX8AB8EXABRBa0AQwQDAEoEUgALBR//8gUm/+UFuwDMA7EASwf7ADUE2wDrBPEAfwYBALYGrACSBqUAkAZDAL4EbQBNBWQAJASL/60EcACrBKAAQQf7AEsB/f8VBF8AMwRCAHAD/P/TBBkAGAPpAEICRAB3AnwAcQH1/+QE1wB1BE0AWQRoAHUGoAB1BqAAdQTIAHUGaAAoAAAAAAf1/6sINQBcAtj/6gLYAGwC2AAcA/EAaQPxACcD8QBwA/AASwPxAEoD8f/3A/EAFwPx//0D8QC9A/EARgQD/90ECwB1BDP/twXmAJQERgB5BFsAQgQHAG4EAAASBCkAHQSYAEYEOwAeBJgATAS9AB4F1AAeA5kAHgQ0AB4Dsv/2AdoAKwS+AB4EiABMA68AHgQAABIEFAAGA4UAGQOTAB4ERv+wBJgATARG/7ADbv/TBKoAHgPS/9YFPgBSBPAAfQTNAA4FSQBtBFoASAcK/8MHGAAeBUoAbgSpAB4EOQAgBP3/iQXd/68EHwASBMYAIAQtAB8EnP/EBAAAWgUBAB4ESABWBiAAHgZ5AB4E9gBRBc0AIAQuACAEWgAgBkUAHgRk/+AD8//6Bhj/rwRXAB8E4wAfBQ8AagWXAFAERwB1BIT/twYxAG0ESABVBEgAHgWYAC4EpgBABB8AEgScAEYEFAAAA8YAHwfkAB4Eh//eAtj/+wLY//EC2AAXAtgAHQLYAC8C2AAIAtgANwN7AJMCoAELA8gAHgQa/5kEnwBIBSMARAT9AEQD9QAmBRUARAPwACYEXQAeBFoASAQwAB4EY/+mAe8A/AOJARIAAP0qA9IA0wPWACID8ADOA9cAzQOTAB4DhAESA4MBEwLiAI8C4gBkAuIAigLiAJAC4gCiAuIAewLiAKoFWACABYMAgQVoAEQFswCDBbYAgwO4ALwEXwA5BDf/gQSq/9MESf/VBA4AKwOJARQBhv++BnEATASWAD4B7f8PBGb/rARm/+MEZv+4BGYALARmAFYEZgAkBGYAZgRmABsEZgBABGYBDQIA/wkB//8JAfYALwH2/3gB9gAvBDAAHgTaAGQEAQBiBFwAHwQTAEQEcABDBGkAIwR8AEIEa//XBHkAQgQdAEYEXAA1BE7/vwNoAKkEsQAsA5n/6QYK/5oD2gAeBJj/9AS9AB4EvQAeAfcAAAIlABoFNgAvBTYALwRkAD4EoQCpAor/9AUQ/68FEP+vBRD/rwUQ/68FEP+vBRD/rwUQ/68FDQBwBGkAOwRpADsEaQA7BGkAOwIcAEkCHABJAhwASQIcAEkFiQA7BVcAcwVXAHMFVwBzBVcAcwVXAHMFCABjBQgAYwUIAGMFCABjBKkAqAQ5ADEEOQAxBDkAMQQ5ADEEOQAxBDkAMQQ5ADEEEABGBB0ARQQdAEUEHQBFBB0ARQHsAC8B7AAvAewALwHsAC8ESQAgBG0ARgRtAEYEbQBGBG0ARgRtAEYERwBbBEcAWwRHAFsERwBbA6z/qgOs/6oFEP+vBDkAMQUQ/68EOQAxBRD/rwQ5ADEFDQBwBBAARgUNAHAEEABGBQ0AcAQQAEYFDQBwBBAARgUYADsE9gBHBGkAOwQdAEUEaQA7BB0ARQRpADsEHQBFBGkAOwQdAEUEaQA7BB0ARQVJAHQEXAADBUkAdARcAAMFSQB0BFwAAwVJAHQEXAADBYkAOwRGACACHABJAewAEQIcAEkB7AAuAhwASQHsAC8CHP+LAeP/bQIcAEkGZABJA74ALwRIAAcB9f8JBN4AOwPvACAELgA7AeMALwQuADsB4/+iBC4AOwJ5AC8ELgA7Ar8ALwWJADsESQAgBYkAOwRJACAFiQA7BEkAIARJACAFVwBzBG0ARgVXAHMEbQBGBVcAcwRtAEYEyAA7AqEAIATIADsCof+fBMgAOwKhACAEnAApBAEALgScACkEAQAuBJwAKQQBAC4EnAApBAEALgScACkEAQAuBKEAqQKKAEMEoQCpAooAQwShAKkCsgBDBQgAYwRHAFsFCABjBEcAWwUIAGMERwBbBQgAYwRHAFsFCABjBEcAWwUIAGMERwBbBuIAwwXVAIAEqQCoA6z/qgSpAKgEpv/sA9r/7gSm/+wD2v/uBKb/7APa/+4HQf+DBo4AEwVXACAEZgA6BF3/rwRd/68EBwBuBGP/pgRj/6YEY/+mBGP/pgRj/6YEY/+mBGP/pgRaAEgDyAAeA8gAHgPIAB4DyAAeAdoAKwHaACsB2gArAdoAKwS9AB4EmABMBJgATASYAEwEmABMBJgATARbAEIEWwBCBFsAQgRbAEIECwB1BGP/pgRj/6YEY/+mBFoASARaAEgEWgBIBFoASARdAB4DyAAeA8gAHgPIAB4DyAAeA8gAHgSIAEwEiABMBIgATASIAEwEvgAeAdoADgHaACsB2gArAeT/ggHaACsDsv/2BDQAHgOZAB4DmQAeA5kAHgOZAB4EvQAeBL0AHgS9AB4EmABMBJgATASYAEwEKQAdBCkAHQQpAB0EAAASBAAAEgQAABIEAAASBAcAbgQHAG4EBwBuBFsAQgRbAEIEWwBCBFsAQgRbAEIEWwBCBeYAlAQLAHUECwB1BAP/3QQD/90EA//dBRD/rwTNAAMF7QARAoAAFwVrAGsFDf/tBT0AHgKEACAFEP+vBNYAOwRpADsEpv/sBYkAOwIcAEkE3gA7BsYAOwWJADsFVwBzBOUAOwShAKkEqQCoBN3/1AIcAEkEqQCoBGMASAQwACkEZgAlAoQAhAQ8AGgEUgAuBG0ARgRm/+YDwgBuBE7/vwKEAGUEPABoBG0ARgQ8AGgGZABnBGkAOwRRAEQEnAApAhwASQIcAEkESAAHBP0ARATeADsE4QCUBRD/rwTWADsEUQBEBGkAOwWJAEQGxgA7BYkAOwVXAHMFiQBEBOUAOwUNAHAEoQCpBN3/1AQ5ADEEHQBFBHsAMARtAEYEXP/XBBAARgOs/6oD2v/FBB0ARQNCAC4EAQAuAeMALwHsAC8B2/8TBDIAMAOs/6oG4gDDBdUAgAbiAMMF1QCABuIAwwXVAIAEqQCoA6z/qgFbAKwCfADJBAAARAH1/wkBjgCJBsYAOwbOAB4FEP+vBDkAMQRpADsFiQBEBB0ARQR7ADAFXgCFBW8ATgTkAK0D5QCFCBkARgkDAHMEnAAlA/EAIAUNAHAEEABGBKkAqAPkAIUCHABJBwv/qwXy/6cCHABJBRD/rwQ5ADEFEP+vBDkAMQdB/4MGjgATBGkAOwQdAEUFXQBSBBgAPwQYAD8HC/+rBfL/pwScACUD8QAgBYkARAR7ADAFiQBEBHsAMAVXAHMEbQBGBUgAZwRpAEMFSABnBGkAQwU8AHYELQAyBOEAlAOs/6oE4QCUA6z/qgThAJQDrP+qBVAAywQ5AHkGwABEBhAAMQRgAEcFEP+vBDkAMQUQ/68EOQAxBRD/rwQ5ADEFEP+vBDkAMQUQ/68EOQAxBRD/rwQ5ADEFEP+vBDkAMQUQ/68EOQAxBRD/rwQ5ADEFEP+vBDkAMQUQ/68EOQAxBRD/rwQ5ADEEaQA7BB0ARQRpADsEHQBFBGkAOwQdAEUEaQA7BB0ARQRpADsEHQBFBGkAOwQdAEUEaQA7BB0ARQRpADsEHQBFAhwASQHsAC8CHAANAeP/8AVXAHMEbQBGBVcAcwRtAEYFVwBzBG0ARgVXAHMEbQBGBVcAcwRtAEYFVwBzBG0ARgVXAHMEbQBGBVUAZgRwAEMFVQBmBHAAQwVVAGYEcABDBVUAZgRwAEMFVQBmBHAAQwUIAGMERwBbBQgAYwRHAFsFZQBjBM0AWwVlAGMEzQBbBWUAYwTNAFsFZQBjBM0AWwVlAGMEzQBbBKkAqAOs/6oEqQCoA6z/qgSpAKgDrP+qBH4AAAShAKkDuwBgBVAAywQ5AHkEUQBEA0IALgYAAIgEmgAEBEYAIATeACwE3gAsBFEAEQNC/+cFEQBYBAkAOgSpAKgD5ABeBN3/1APa/8UEMAApBEr/1wYZAJgEXAAYBFwANQRcAAUEXAByBHAAgQSEAFQEcACUBIQAfgVJAHQEXAADBYkAOwRJACAFEP+vBDkAMQRpADsEHQBFAhz/4AHs/40FVwBzBG0ARgTIADsCoQAgBQgAYwRHAFsEhv+xBNYAOwRcAB8FGAA7BGAARwUYADsEYABHBYkAOwRGACAE3gA7A+8AIATeADsD7wAgBC4AOwHj//AGxgA7Bs4AHgWJADsESQAgBVcAcwTlADsEXP/XBMgAOwKh/+4EnAApBAEALgShAKkCigBDBQgAYwTxAKUDwgBuBPEApQPCAG4G4gDD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rgSuGK4qrjauSK5arm2uga6Vruuu/q8QryOvNq9Jr1uvbq+Cr46voq+2r8mv3a/yr/qwArAKsBKwGrAisCqwMrA6sEKwSrBSsFqwYrB2sIqwnbCwsMOw1bDpsPGw+bEBsQmxEbEksTexSrFdsXCxhLGXsf2yBbIZsiGyKbI8sk+yV7Jfsmeyb7KCsoqykrKasqKyqrKysrqywrLKstKy5bLtsvWzPbNFs02zYbN0s3yzhLOYs6Czs7PFs9iz67P+tBG0JbQ5tEy0X7RntG+0e7SOtJa0qbS8tNG05rT5tQy1H7UytTq1QrVWtWq1drWCtZW1qLW7tc611rXetea1+bYMthS2J7Y6tk62YrZqtnK2hbaYtqy2tLbItty28LcEtxe3Krc8t1C3ZLd4t4y3lLect7C3xLfYt+y3/7gRuCW4OLhMuGC4dLiHuJu4r7i3uMu437jyuQW5GbksuUC5U7lnuXq5jrmhub652rnuugK6Froquj66Urpmunq6l7q0usi63LrvuwK7Fbsnuzu7Trtiu3W7ibucu7C7w7vgu/y8D7wivDa8SrxevHK8hbyYvKy8v7zTvOa8+r0NvSG9NL1RvW29gL2Tvaa9ub3Mvd+98r4Evhi+LL5AvlS+Z756vo2+oL6zvsa+2b7svv+/Eb8lvzm/Tb9hv3S/h7+av6y/yb/cv+/AAsAVwCjAO8BOwGHAacCswO7BE8E4wXnBvMHswiHCWMKPwpfCq8KzwrvCw8LLwtPC28LjwuvC88MGwxnDLMM/w1PDZ8N7w4/Do8O3w8vD38PzxAfEG8QvxDvET8RjxHfEi8SfxLPEx8TbxO7FAcUVxSnFPcVRxWXFecWNxaHFtcXIxdvF78YDxhfGK8Y/xlPGZ8Z6xozGoMa0xsjG3MbwxwTHGMckxzDHPMdIx1THYMdsx3THfMeEx4zHlMecx6THrMe0x7zHxMfMx9TH3MfwyAPIFsgpyDHIOchNyFXIaMh6yILIisiSyJrIrci1yL3IxcjNyNXI3cjlyO3JacmdyfDJ+MoEyhfKKcoxyj3KUMpjym/KgsqVyqnKtcrIytvK7ssByw3LGcstAAYAZAAAAygFsAADAAcACwAPABMAFwAAQRUhNTMRIxEhESMRExUhNQEBIwERATMBAwn9dhs2AsQ2F/12Aor9rzoCUf2vOgJRBbA2NvpQBbD6UAWw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AGUA+wD8AGgA/gEAAGoBAwEFAG0BCgEKAHABDQENAHEBGAEaAHIBIgEiAHUBLgEwAHYBMwE1AHkBNwE3AHwBOQE5AH0BOwE7AH4BQwFEAH8BVAFUAIEBVgFWAIIBWAFYAIMBXAFeAIQBhAGFAIcBhwGJAIkB2AHYAIwB2gHbAI0B3QHdAI8B4AHgAJAB6wHtAJECMAIwAJQCMwIzAJUCRQJFAJYCRwJIAJcCewJ8AJkCfgJ+AJsCgAKVAJwCmgKhALICowKmALoCqwKwAL4CtQK9AMQCvwK/AM0CwQLBAM4CwwLDAM8CxQLFANACxwLQANEC2QLbANsC3QLdAN4C3wLfAN8C4QLhAOAC4wLjAOEC6ALoAOIC6gLqAOMC7ALsAOQC7gLuAOUC8ALwAOYC8gL+AOcDAAMAAPQDAgMCAPUDBAMEAPYDDwMPAPcDEQMRAPgDEwMTAPkDIQMhAPoDIwMmAPsDKAMoAP8DKgMqAQADMAM5AQEDRANIAQsDTgNQARADVQNVARMDZwNqARQDbgNwARgDeQN5ARsDhwOMARwDjwOeASIDoQOhATIDpQOlATMDpwOnATQDqwOrATUDrgOvATYDsQOyATgDtAO6AToDvAO+AUEDwAPFAUQDxwPIAUoDygPNAUwD0wPUAVAD1gPWAVID2APYAVMD2gPdAVQD4APlAVgD5wPnAV4D6wPsAV8D8QPxAWED8wP8AWID/wQAAWwEAgQFAW4EDAQNAXIEEQQRAXQEEwQZAXUEHwRHAXwESQRJAaUESwRYAaYEYARgAbQEcQR2AbUEeAR4AbsEfAR9AbwEgASAAb4EggSDAb8EhQSFAcEEhwSHAcIEmAScAcMEngSeAcgEoAShAckEowSjAcsEpwSpAcwEqwSrAc8ErQSvAdAEsQSxAdMEswSzAdQEtQS7AdUEvQS9AdwEwATAAd0EwwTHAd4EyQTJAeMEywTMAeQE0ATQAeYE0wTTAecE3gTeAegE6wTrAekE8gTyAeoE9gT2AesACwA4/9gA0v/YANb/2AE5/9gBRf/YAw//2AMR/9gDE//YA8L/2AR4/9gEwP/YABgAOgAUADsAEgA9ABYBGQAUApoAFgMhABIDIwAWAyUAFgOMABYDmwAWA54AFgPUABID1gASA9gAEgPaABYD6wAUA/MAFgRxABYEcwAWBHUAFgSHABYEwwAUBMUAFATHABIAAQAT/yAA5wAQ/xYAEv8WACX/VgAu/vgAOAAUAEX/3gBH/+sASP/rAEn/6wBL/+sAU//rAFX/6wBW/+YAWf/qAFr/6ABd/+gAlP/rAJn/6wCb/+oAsv9WALT/VgC7/+sAvf/oAMj/6wDJ/+sAy//qANIAFADWABQA9//rAQP/6wEN/1YBGP/rARr/6AEe/+sBIv/rATkAFAFC/+sBRQAUAWD/6wFh/+sBa//rAYb/FgGK/xYBjv8WAY//FgHr/8AB7f/AAjP/wAKA/1YCgf9WAoL/VgKD/1YChP9WAoX/VgKG/1YCm//eApz/3gKd/94Cnv/eAp//3gKg/94Cof/eAqL/6wKj/+sCpP/rAqX/6wKm/+sCrP/rAq3/6wKu/+sCr//rArD/6wKx/+oCsv/qArP/6gK0/+oCtf/oArb/6AK3/1YCuP/eArn/VgK6/94Cu/9WArz/3gK+/+sCwP/rAsL/6wLE/+sCxv/rAsj/6wLK/+sCzP/rAs7/6wLQ/+sC0v/rAtT/6wLW/+sC2P/rAub++AL6/+sC/P/rAv7/6wMPABQDEQAUAxMAFAMW/+oDGP/qAxr/6gMc/+oDHv/qAyD/6gMk/+gDM//AAzT/wAM1/8ADNv/AAzf/wAM4/8ADOf/AA07/wANP/8ADUP/AA4f/VgOP/1YDn//rA6P/6gOl/+sDp//oA6r/6gOr/+sDrP/qA7P++AO3/1YDwgAUA8T/3gPF/+sDx//rA8n/6wPK/+gDzP/rA9P/6APb/+gD4/9WA+T/3gPn/+sD7P/oA+3/6wPy/+sD9P/oA/n/VgP6/94D+/9WA/z/3gQA/+sEAv/rBAP/6wQN/+sED//rBBH/6wQV/+gEF//oBBn/6AQe/+sEH/9WBCD/3gQh/1YEIv/eBCP/VgQk/94EJf9WBCb/3gQn/1YEKP/eBCn/VgQq/94EK/9WBCz/3gQt/1YELv/eBC//VgQw/94EMf9WBDL/3gQz/1YENP/eBDX/VgQ2/94EOP/rBDr/6wQ8/+sEPv/rBED/6wRC/+sERP/rBEb/6wRM/+sETv/rBFD/6wRS/+sEVP/rBFb/6wRY/+sEWv/rBFz/6wRe/+sEYP/rBGL/6wRk/+oEZv/qBGj/6gRq/+oEbP/qBG7/6gRw/+oEcv/oBHT/6AR2/+gEeAAUBJr/VgSb/94Enf/rBKH/6wSl/+oEqv/rBKz/6wTAABQExP/oBMb/6ATM/8AE0//ABOv/wAAzADj/1QA6/+QAO//sAD3/3QDS/9UA1v/VARn/5AE5/9UBRf/VAesADgHtAA4CMwAOApr/3QMP/9UDEf/VAxP/1QMh/+wDI//dAyX/3QMzAA4DNAAOAzUADgM2AA4DNwAOAzgADgM5AA4DTgAOA08ADgNQAA4DjP/dA5v/3QOe/90Dwv/VA9T/7APW/+wD2P/sA9r/3QPr/+QD8//dBHH/3QRz/90Edf/dBHj/1QSH/90EwP/VBMP/5ATF/+QEx//sBMwADgTTAA4E6wAOAB0AOP+wADr/7QA9/9AA0v+wANb/sAEZ/+0BOf+wAUX/sAKa/9ADD/+wAxH/sAMT/7ADI//QAyX/0AOM/9ADm//QA57/0APC/7AD2v/QA+v/7QPz/9AEcf/QBHP/0AR1/9AEeP+wBIf/0ATA/7AEw//tBMX/7QARAC7/7gA5/+4Clv/uApf/7gKY/+4Cmf/uAub/7gMV/+4DF//uAxn/7gMb/+4DHf/uAx//7gOz/+4EY//uBGX/7gTC/+4ATQAGABAACwAQAA0AFABBABIAR//oAEj/6ABJ/+gAS//oAFX/6ABhABMAlP/oAJn/6AC7/+gAyP/oAMn/6AD3/+gBA//oAR7/6AEi/+gBQv/oAWD/6AFh/+gBa//oAYQAEAGFABABhwAQAYgAEAGJABACov/oAqP/6AKk/+gCpf/oAqb/6AK+/+gCwP/oAsL/6ALE/+gCxv/oAsj/6ALK/+gCzP/oAs7/6ALQ/+gC0v/oAtT/6ALW/+gC2P/oA5//6APF/+gDyf/oA8z/6APcABAD3QAQA+AAEAPn/+gD7f/oA/L/6AQA/+gEAv/oBAP/6AQP/+gEHv/oBDj/6AQ6/+gEPP/oBD7/6ARA/+gEQv/oBET/6ARG/+gEWv/oBFz/6ARe/+gEYv/oBJ3/6ASq/+gErP/oAEAAR//sAEj/7ABJ/+wAS//sAFX/7ACU/+wAmf/sALv/7ADI/+wAyf/sAPf/7AED/+wBHv/sASL/7AFC/+wBYP/sAWH/7AFr/+wCov/sAqP/7AKk/+wCpf/sAqb/7AK+/+wCwP/sAsL/7ALE/+wCxv/sAsj/7ALK/+wCzP/sAs7/7ALQ/+wC0v/sAtT/7ALW/+wC2P/sA5//7APF/+wDyf/sA8z/7APn/+wD7f/sA/L/7AQA/+wEAv/sBAP/7AQP/+wEHv/sBDj/7AQ6/+wEPP/sBD7/7ARA/+wEQv/sBET/7ARG/+wEWv/sBFz/7ARe/+wEYv/sBJ3/7ASq/+wErP/sABkAU//sARj/7AGFAAACrP/sAq3/7AKu/+wCr//sArD/7AL6/+wC/P/sAv7/7AOl/+wDq//sA8f/7AQN/+wEEf/sBEz/7ARO/+wEUP/sBFL/7ARU/+wEVv/sBFj/7ARg/+wEof/sAAYAEP+EABL/hAGG/4QBiv+EAY7/hAGP/4QAEQAu/+wAOf/sApb/7AKX/+wCmP/sApn/7ALm/+wDFf/sAxf/7AMZ/+wDG//sAx3/7AMf/+wDs//sBGP/7ARl/+wEwv/sACAABv/yAAv/8gBa//MAXf/zAL3/8wD2//UBGv/zAYT/8gGF//IBh//yAYj/8gGJ//ICtf/zArb/8wMk//MDp//zA8r/8wPT//MD2//zA9z/8gPd//ID4P/yA+z/8wP0//MEFf/zBBf/8wQZ//MEcv/zBHT/8wR2//MExP/zBMb/8wA/ACf/8wAr//MAM//zADX/8wCD//MAk//zAJj/8wCz//MAxAANANP/8wEI//MBF//zARv/8wEd//MBH//zASH/8wFB//MBav/zAkX/8wJG//MCSP/zAkn/8wKH//MCkf/zApL/8wKT//MClP/zApX/8wK9//MCv//zAsH/8wLD//MC0f/zAtP/8wLV//MC1//zAvn/8wL7//MC/f/zAy7/8wOL//MDmP/zA77/8wPB//MD7v/zA/H/8wQM//MEDv/zBBD/8wRL//METf/zBE//8wRR//MEU//zBFX/8wRX//MEWf/zBFv/8wRd//MEX//zBGH/8wSg//MEuf/zAEAAJ//mACv/5gAz/+YANf/mAIP/5gCT/+YAmP/mALP/5gC4/8IAxAAQANP/5gEI/+YBF//mARv/5gEd/+YBH//mASH/5gFB/+YBav/mAkX/5gJG/+YCSP/mAkn/5gKH/+YCkf/mApL/5gKT/+YClP/mApX/5gK9/+YCv//mAsH/5gLD/+YC0f/mAtP/5gLV/+YC1//mAvn/5gL7/+YC/f/mAy7/5gOL/+YDmP/mA77/5gPB/+YD7v/mA/H/5gQM/+YEDv/mBBD/5gRL/+YETf/mBE//5gRR/+YEU//mBFX/5gRX/+YEWf/mBFv/5gRd/+YEX//mBGH/5gSg/+YEuf/mADgAJf/kADz/0gA9/9MAsv/kALT/5ADE/+IA2v/SAQ3/5AEz/9IBQ//SAV3/0gKA/+QCgf/kAoL/5AKD/+QChP/kAoX/5AKG/+QCmv/TArf/5AK5/+QCu//kAyP/0wMl/9MDh//kA4z/0wOP/+QDm//TA5z/0gOe/9MDt//kA8P/0gPa/9MD4//kA/P/0wP2/9ID+f/kA/v/5AQE/9IEH//kBCH/5AQj/+QEJf/kBCf/5AQp/+QEK//kBC3/5AQv/+QEMf/kBDP/5AQ1/+QEcf/TBHP/0wR1/9MEh//TBJr/5AAoABD/HgAS/x4AJf/NALL/zQC0/80Ax//yAQ3/zQGG/x4Biv8eAY7/HgGP/x4CgP/NAoH/zQKC/80Cg//NAoT/zQKF/80Chv/NArf/zQK5/80Cu//NA4f/zQOP/80Dt//NA+P/zQP5/80D+//NBB//zQQh/80EI//NBCX/zQQn/80EKf/NBCv/zQQt/80EL//NBDH/zQQz/80ENf/NBJr/zQABAMQADgACAMr/7QD2/8AAugBH/9wASP/cAEn/3ABL/9wAUf/zAFL/8wBT/9YAVP/zAFX/3ABZ/90AWv/hAF3/4QCU/9wAmf/cAJv/3QC7/9wAvf/hAL7/7gC//+YAwf/zAML/6wDD/+kAxf/wAMb/5wDI/9wAyf/cAMr/4wDL/90AzP/OAM3/1ADO/9sA7P/zAPD/8wDx//MA8//zAPT/8wD1//MA9//cAPj/8wD6//MA+//zAP7/8wEA//MBA//cAQX/8wEY/9YBGv/hAR7/3AEi/9wBK//zATb/8wE8//MBPv/zAUL/3AFT//MBVf/zAVf/8wFc//MBYP/cAWH/3AFr/9wCov/cAqP/3AKk/9wCpf/cAqb/3AKr//MCrP/WAq3/1gKu/9YCr//WArD/1gKx/90Csv/dArP/3QK0/90Ctf/hArb/4QK+/9wCwP/cAsL/3ALE/9wCxv/cAsj/3ALK/9wCzP/cAs7/3ALQ/9wC0v/cAtT/3ALW/9wC2P/cAvP/8wL1//MC9//zAvj/8wL6/9YC/P/WAv7/1gMW/90DGP/dAxr/3QMc/90DHv/dAyD/3QMk/+EDn//cA6H/8wOj/90Dpf/WA6f/4QOq/90Dq//W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BL0AGwTABMAAEgTCBMIACATDBMMAHATEBMQABwTFBMUAHATGBMYABwTHBMcAGATJBMkAGQTKBMoAHwTLBMsAAQTMBMwACwTQBNAACgTTBNMACwTZBNkAFATeBN4AHQTpBOkAFATrBOsACwTyBPIACgT2BPYAHQABAAYE9gAPAAAAAAAAAAAADwAAAAAAAAAAABgAGwAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAACAAAAAAAAAAIAAAAAACMAAAAAAAAAAAACAAAAAgAAABQADQALABoAFgAQAAwAFwAAAAAAAAAAAAAAAAAGAAAAAQABAAEAAAABAAAAAAAAAAAAAAADAAMABwADAAEAAAARAAAACAAJAAAAEwAJAB0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAEAAAAAAAAAAgABAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAgAEAAAAAAAAAAAAAAAAAAEAAAAJAAAAAAAAAAMAAAAAAAAAAAAAAAAAAQABAAAACAAAAAAAAAAAAAAAAAANAAIAHgAAAA0AAAAAAAAAEAAAAAAAHgAfAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAABMAAAADAAMAIQADAAMAAwAAAAEAAwAiAAMAAwAAAAAAAwAAAAMAAAAAAAEAIQADAAAAAAACAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAACAAcAGgAJAAIAAAACAAEAAgAAAAIAAQAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAABAAEwAAAAMAAAAAAA0AAAAAAAMAAAADAAAAAAACAAEAEAATAA0AAAAgACIAAAAAAAAAAAAAAAAAAAAeACEAAAADAAAAAwAAAAMAAAAAAAAAAAADABAAEwAAAAEAAQAAAAAAAAAAAB4AAAAAAAAAAgABAAAAAAAAAB4AIQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABsAGwAAAA8ADwAYAA8ADwAPABgAAAAAAAAAGAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAZACQAAAAOABUAHAAAAAUAAAAFAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAACgAFAAoAAAAAAAAAAAAAAAAAFQAFAAAAAAAVAAAAAAAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZAAAAAAAVAAUAEgAZABUAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAAAAAgACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABsAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQAAgAAAAAAAAAAAAAAAAAAAAAAAAACAAIAAgACAAIACwALAAsACwAMAAYABgAGAAYABgAGAAYAAQABAAEAAQABAAAAAAAAAAAAAwAHAAcABwAHAAcACAAIAAgACAAJAAkABAAGAAQABgAEAAYAAgABAAIAAQACAAEAAgABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAIAAQACAAEAAgABAAIAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAMAAAADAAMAAgAHAAIABwACAAcAAAAAAAAAAAAAAAAAFAARABQAEQAUABEAFAARABQAEQANAAAADQAAAA0AAAALAAgACwAIAAsACAALAAgACwAIAAsACAAWAAAADAAJAAwAFwAdABcAHQAXAB0AAAAAAAIAAAAAAAAAAAAKAAoACgAKAAoACgAKAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAA4ADgAOAA4AEgAKAAoACgAFAAUABQAFAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAHAAcABwAHAAAABUAAAAOAA4ADgAOAA4ADgAkABIAEgAAAAAAAAAEAAAAAAAAAAIADAAAAAAABAAAAAAAFwAAAAAAAAAAAAAAAgAAAAAADAAQAAAADAABAAAAAwAAAAgAAAAHAAAACQAAAAAACAAHAAgAAAAAAAAAAAAAAAAAIwAAAAAAHwAEAAAAAAAAAAAAAAAAAAIAAAAAAAIADQAQAAYAAQADAAcAAwABAAkAEwABAAMAEQAAAAAAAAADAAkAFgAAABYAAAAWAAAADAAJAA8ADwAAAAAADwAAAAMABAAGAAAAAAABAAMAAAAAABoACQABAAIAAAAAAAIAAQAMAAkAAAAQABMAAAAEAAYABAAGAAAAAAAAAAEAAAABAAEAEAATAAAAAAAAAAMAAAADAAIABwACAAEAAgAHAAAAAAAfAAkAHwAJAB8ACQAgACIAAAADAAEABAAGAAQABgAEAAYABAAGAAQABgAEAAYABAAGAAQABgAEAAYABAAGAAQABgAEAAYAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAAAAAAAAAIABwACAAcAAgAHAAIABwACAAcAAgAHAAIABwACAAEAAgABAAIAAQACAAcAAgABAAsACAALAAgAAAAIAAAACAAAAAgAAAAIAAAACAAMAAkADAAJAAwACQAAAA0AAAAgACIAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAABsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMABAAGAAAAAQAAAAAAAgAHAAAAAAAAAAgAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAwACAAAAAAAAAAAAFAARAA0AAAALABoACQAaAAkAFgAAABcAHQAAAAoAAAAAAAAABQASAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAZAAAAEgAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAAAAAAAAAFAAAAAAAFABUAGQAAAAAABQASAAEAAAAKAZACzAAEREZMVAAaY3lybAAaZ3JlawAabGF0bgBIAAQAAAAA//8AEgAAAAEAAgADAAQACAANAA4ADwAQABEAEgATABQAFQAWABcAGAAuAAdBWkUgARJDUlQgARJGUkEgAFpNT0wgAIhOQVYgALZST00gAORUUksgARIAAP//ABMAAAABAAIAAwAEAAcACAANAA4ADwAQABEAEgATABQAFQAWABcAGAAA//8AFAAAAAEAAgADAAQABgAIAAkADQAOAA8AEAARABIAEwAUABUAFgAXABgAAP//ABQAAAABAAIAAwAEAAYACAAKAA0ADgAPABAAEQASABMAFAAVABYAFwAYAAD//wAUAAAAAQACAAMABAAGAAgACwANAA4ADwAQABEAEgATABQAFQAWABcAGAAA//8AFAAAAAEAAgADAAQABgAIAAwADQAOAA8AEAARABIAEwAUABUAFgAXABgAAP//ABMAAAABAAIAAwAEAAUACAANAA4ADwAQABEAEgATABQAFQAWABcAGAAZYzJzYwCYY2NtcACeZGxpZwCmZG5vbQCsZnJhYwCybGlnYQC8bGlnYQDCbGlnYQDObG51bQDWbG9jbADcbG9jbADibG9jbADobG9jbADubnVtcgD0b251bQD6cG51bQEAc21jcAEGc3MwMQEMc3MwMgESc3MwMwEYc3MwNAEec3MwNQEkc3MwNgEqc3MwNwEwdG51bQE2AAAAAQAAAAAAAgACAAQAAAABAAsAAAABABsAAAADABcAGAAaAAAAAQAKAAAABAAJAAoACQAKAAAAAgAJAAoAAAABABYAAAABAAgAAAABAAUAAAABAAcAAAABAAYAAAABABwAAAABABMAAAABABQAAAABAAEAAAABAAwAAAABAA0AAAABAA4AAAABAA8AAAABABAAAAABABEAAAABABIAAAABABUAHQA8BDYH9AimCNAPdA90D4oPtA/ID+wQFhBSEGYQehCOEKAQuhD8ERoRbBGyEhQSchKGErYS2BK2EtgAAQAAAAEACAACAfoA+gHnAnIB0QHQAc8BzgHNAcwBywHKAckByAIzAjICMQIwAigB5gHlAeQB4wHiAeEB4AHfAd4B3QHcAdsB2gHZAdgB1wHWAdUB1AHTAdIB6AHpAnQCdgJ1AncCcwJ4AlIB6gHrAewB7QHuAe8B8AHxAfIB8wH0AfUB9gH3AfgB+QH6AfsB/AH9Af4CAAIBBP8CAgIDAgQCBQIGAgcCCAIJAgoCCwI7Ag0CDgIPAhAE+QIRAhMCFAIVAhYCFwIYAhkCGwIcAh4CHQMwAzEDMgMzAzQDNQM2AzcDOAM5AzoDOwM8Az0DPgM/A0ADQQNCA0MDRANFA0YDRwNIA0kDSgNLA0wDTQNOA08DUANRA1IDUwNUA1UDVgNXA1gDWQNaA1sDXANdA14DXwNgA2EDYgNjA2QFAANlA2YDZwNoA2kDagNrA2wDbQNuA28DcANxA3IDcwN0A3UDdgUDA3cDeAN6A3kDewN8A30DfgN/A4ADgQOCA4MDhAOFA4YFAQUCBMwEzQTOBM8E0ATRBNIE0wTUBNUE1gTXBNgE2QTaBNsE3ATdBN4E3wTgBOEE4gTjBOQE5QTmBOcE6AH/BOkE6gTrBOwE7QTuBO8E8ATxBPIE8wT0BPUE9gT3BQQFBQUGBQcE+AT6BPsE/QIaBP4E/AIMAhIFDAUNAAEA+gAIAAoAFAAVABYAFwAYABkAGgAbABwAHQAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANgA3ADgAOQA6ADsAPAA9AD4AZQBnAIEAgwCEAIwAjwCRAJMAsQCyALMAtAC1ALYAtwC4ALkAugDSANMA1ADVANYA1wDYANkA2gDbANwA3QDeAN8A4ADhAOIA4wDkAOUA5gDnAOgA6QEvATMBNQE3ATkBOwFBAUMBRQFJAUsBTAFYAVkBlwGdAaIBpQJ7AnwCfgKAAoECggKDAoQChQKGAocCiAKJAooCiwKMAo0CjgKPApACkQKSApMClAKVApYClwKYApkCmgK3ArkCuwK9Ar8CwQLDAsUCxwLJAssCzQLPAtEC0wLVAtcC2QLbAt0C3wLhAuMC5ALmAugC6gLsAu4C8ALyAvQC9gL5AvsC/QL/AwEDAwMFAwcDCQMLAw0DDwMRAxMDFQMXAxkDGwMdAx8DIQMjAyUDJgMoAyoDLAMuA4cDiAOJA4oDiwOMA40DjwOQA5EDkgOTA5QDlQOWA5cDmAOZA5oDmwOcA50DngOuA68DsAOxA7IDswO0A7UDtgO3A7gDuQO6A7sDvAO9A74DvwPAA8EDwgPDA9QD1gPYA9oD7wPxA/MECAQOBBQEfgSDBIcFCAUKAAEAAAABAAgAAgHcAOsCcgIzAjICMQIwAigB5gHlAeQB4wHiAeEB4AHfAd4B3QHcAdsB2gHZAdgB1wHWAdUB1AHTAdICZAJ0AzECdgJ1AzAB4wJzAngCUgTTBNQB6gHrBNUE1gTXAewE2AHtAe4B7wTdAfAB8ATeBN8B8QHyAfMB+gTsBO0B+wH8Af0B/gH/AgAE8ATxBPME9gT/AgICAwIEAgUCBgIHAggCCQIKAgsB9AH1AfYB9wH4AfkCOwINAg4CDwIQBPkCEQITAhQCFQIXAhkCdwMyAzMDNAM1AzYDNwM4AzkDOgM7AzwDPQM+Az8DQANBA0IDQwNEA0UDRgNHA0gDSQNKA0sDTANNA4MDTgNPA1ADUQNSA1MDVANVA1YDVwNYA1kDWgNbA1wDXQNeA18DYANhA2IDYwUAA2UDZgNnA2gDaQNqA2sDbANtA24DbwNwA3EDcgNzA3QDdQN2BQMDdwN4A3oDeQN7A3wDfQN+A38DgAOBA4IDhAOFA4YFAQUCBMwEzQTOBM8E2QTcBNoE2wTgBOEE4gTQBNEE0gTrBO4E7wTyBPQE9QIBBPcE4wTkBOUE5gTnBOgE6QTqBQQFBQUGBQcE+AT6BPsCGAT9AhoE/gT8AhYCDAISBQwFDQABAOsACgBFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AhQCGAIcAiQCKAIsAjQCQAJIAlAC7ALwAvQC+AL8AwADBAMIAwwDEAMUAxgDHAMgAyQDKAMsAzADNAM4A6gDrAOwA7QDuAO8A8ADxAPIA8wD0APUA9gD3APgA+QD6APsA/AD9AP4A/wEAAQEBAgEDAQQBBQEGAQcBMAE0ATYBOAE6ATwBQgFEAUYBSgFNAVoCfQJ/ApsCnAKdAp4CnwKgAqECogKjAqQCpQKmAqcCqAKpAqoCqwKsAq0CrgKvArACsQKyArMCtAK1ArYCuAK6ArwCvgLAAsICxALGAsgCygLMAs4C0ALSAtQC1gLYAtoC3ALeAuAC4gLlAucC6QLrAu0C7wLxAvMC9QL3AvoC/AL+AwADAgMEAwYDCAMKAwwDDgMQAxIDFAMWAxgDGgMcAx4DIAMiAyQDJwMpAysDLQMvA58DoAOhA6IDpAOlA6YDpwOoA6kDqgOrA6wDrQPEA8UDxgPHA8gDyQPKA8sDzAPNA84DzwPQA9ED0gPTA9UD1wPZA9sD8APyA/QEAgQJBA8EFQR/BIAEhASIBQkFCwAGAAAABgASACoAQgBaAHIAigADAAAAAQASAAEAkAABAAAAAwABAAEATQADAAAAAQASAAEAeAABAAAAAwABAAEATgADAAAAAQASAAEAYAABAAAAAwABAAEC4gADAAAAAQASAAEASAABAAAAAwABAAEDzwADAAAAAQASAAEAMAABAAAAAwABAAED0QADAAAAAQASAAEAGAABAAAAAwABAAEESgACAAIAqACsAAABJAEnAAUAAQAAAAEACAACABIABgJhAl8CYgJjAmAFDgABAAYATQBOAuIDzwPRBEoABAAAAAEACAABBjIANgByAKQArgC4AMoA/AEOARgBSgFkAX4BkAG6AfYCAAIiAjwCTgKKApwCtgLgAvIDJAMuAzgDSgN8A4YDkAOaA7QDzgPgBAoEPARGBGgEggSUBMYE2ATyBRwFLgU4BUIFTAVWBYAFqgXUBf4GKAAGAA4AFAAaACAAJgAsAoEAAgCpBB8AAgCtAoAAAgCoBCEAAgCrAoMAAgCqBJoAAgCsAAEABASnAAIArQABAAQCvQACAKkAAgAGAAwEqwACAboEqQACAK0ABgAOABQAGgAgACYALAKJAAIAqQQ3AAIArQKIAAIAqAQ5AAIAqwQ7AAIAqgScAAIArAACAAYADASWAAIAqQLXAAIBugABAAQErQACAK0ABgAOABQAGgAgACYALAKNAAIAqQRJAAIArQKMAAIAqARHAAIAqwLbAAIAqgSeAAIArAADAAgADgAUBK8AAgCpAugAAgG6BLEAAgCtAAMACAAOABQC6gACAKkC7AACAboEswACAK0AAgAGAAwD4QACAKkEtQACAK0ABQAMABIAGAAeACQC8gACAKkC9AACAboEtwACAK0EmAACAKgCkAACAKoABwAQABgAHgAkACoAMAA2BLkAAwCqAKkCkgACAKkESwACAK0CkQACAKgETQACAKsClAACAKoEoAACAKwAAQAEBLoAAgCpAAQACgAQABYAHAL/AAIAqQMBAAIBugS8AAIArQSiAAIArAADAAgADgAUAwUAAgCpAwsAAgG6BL4AAgCtAAIABgAMAw8AAgG6BMAAAgCtAAcAEAAYAB4AJAAqADAANgTCAAMAqgCpApcAAgCpBGMAAgCtApYAAgCoBGUAAgCrAxUAAgCqBKQAAgCsAAIABgAMBMUAAgCtBMMAAgCqAAMACAAOABQD1gACAKkExwACAK0D1AACAKgABQAMABIAGAAeACQCmgACAKkEcQACAK0D2gACAKgEcwACAKsEdQACAKoAAgAGAAwDJgACAKkEyQACAK0ABgAOABQAGgAgACYALAKcAAIAqQQgAAIArQKbAAIAqAQiAAIAqwKeAAIAqgSbAAIArAABAAQEqAACAK0AAQAEAr4AAgCpAAIABgAMBKwAAgG6BKoAAgCtAAYADgAUABoAIAAmACwCpAACAKkEOAACAK0CowACAKgEOgACAKsEPAACAKoEnQACAKwAAQAEBJcAAgCpAAEABASuAAIArQABAAQESgACAK0AAwAIAA4AFASwAAIAqQLpAAIBugSyAAIArQADAAgADgAUAusAAgCpAu0AAgG6BLQAAgCtAAIABgAMA+IAAgCpBLYAAgCtAAUADAASABgAHgAkAvMAAgCpAvUAAgG6BLgAAgCtBJkAAgCoAqsAAgCqAAYADgAUABoAIAAmACwCrQACAKkETAACAK0CrAACAKgETgACAKsCrwACAKoEoQACAKwAAQAEBLsAAgCpAAQACgAQABYAHAMAAAIAqQMCAAIBugS9AAIArQSjAAIArAADAAgADgAUAwYAAgCpAwwAAgG6BL8AAgCtAAIABgAMAxAAAgG6BMEAAgCtAAYADgAUABoAIAAmACwCsgACAKkEZAACAK0CsQACAKgEZgACAKsDFgACAKoEpQACAKwAAgAGAAwExgACAK0ExAACAKoAAwAIAA4AFAPXAAIAqQTIAAIArQPVAAIAqAAFAAwAEgAYAB4AJAK1AAIAqQRyAAIArQPbAAIAqAR0AAIAqwR2AAIAqgACAAYADAMnAAIAqQTKAAIArQABAAQDLAACAKkAAQAEAy4AAgCpAAEABAMtAAIAqQABAAQDLwACAKkABQAMABIAGAAeACQCqAACAKkCpwACAKgESAACAKsC3AACAKoEnwACAKwABQAMABIAGAAeACQEWQACAKkEYQACAK0EWwACAKgEXQACAKsEXwACAKoABQAMABIAGAAeACQEWgACAKkEYgACAK0EXAACAKgEXgACAKsEYAACAKoABQAMABIAGAAeACQEZwACAKkEbwACAK0EaQACAKgEawACAKsEbQACAKoABQAMABIAGAAeACQEaAACAKkEcAACAK0EagACAKgEbAACAKsEbgACAKoAAQAEBKYAAgCpAAIAEQAlACkAAAArAC0ABQAvADQACAA2ADsADgA9AD4AFABFAEkAFgBLAE0AGwBPAFQAHgBWAFsAJABdAF4AKgCBAIEALACDAIMALQCGAIYALgCJAIkALwCNAI0AMACYAJsAMQDQANAANQABAAAAAQAIAAEABgACAAEAAgMJAwoAAQAAAAEACAACABIABgUIBQkFCgULBQwFDQABAAYCuwK8As0CzgNQA1kAAQAAAAEACAABAAYAAQABAAEBewAEAAAAAQAIAAEAQAABAAgAAgAGAA4BvgADAEoATQG8AAIATQAEAAAAAQAIAAEAHAABAAgAAgAGAA4BvwADAEoAUAG9AAIAUAABAAEASgAEAAAAAQAIAAEAKgADAAwAFgAgAAEABAG7AAIASgABAAQBwQACAFgAAQAEAcAAAgBYAAEAAwBKAFcAlQABAAAAAQAIAAEABgHeAAEAAQBLAAEAAAABAAgAAQAGAW8AAQABALsAAQAAAAEACAABAAYB9QABAAEANgABAAAAAQAIAAIAHAACAiwCLQABAAAAAQAIAAIACgACAi4CLwABAAIALwBPAAEAAAABAAgAAgAeAAwCRQJHAkYCSAJJAmcCaAJpAmoCawJsAm0AAQAMACcAKAArADMANQBGAEcASABLAFMAVABVAAEAAAABAAgAAgAMAAMCbgJvAm8AAQADAEkASwJqAAEAAAABAAgAAgAuABQCWgJeAlgCVQJXAlYCWwJZAl0CXAJPAkoCSwJMAk0CTgAaABwCUwJlAAIABAAUAB0AAAJmAmYACgJxAnEACwSOBJUADAABAAAAAQAIAAIALgAUBJUCcQSOBI8EkASRBJICZgSTBJQCTAJOAk0CSwJPAmUAGgJTABwCSgACAAIAFAAdAAACVQJeAAoAAQAAAAEACAACAC4AFAJbAl0CXgJYAlUCVwJWAlkCXAJaABsAFQAWABcAGAAZABoAHAAdABQAAQAUABoAHAJKAksCTAJNAk4CTwJTAmUCZgJxBI4EjwSQBJEEkgSTBJQElQABAAAAAQAIAAIALgAUBJIEkwJxBI4EjwSQBJECZgSUABcAGQAYABYAGwAUABoAHQAcABUElQACAAYAGgAaAAAAHAAcAAECSgJPAAICUwJTAAgCVQJeAAkCZQJlABMAAQAAAAEACAABAAYBgQABAAEAEwAGAAAAAQAIAAMAAQASAAEAbAAAAAEAAAAZAAIAAwGUAZQAAAHFAccAAQIfAiUABAABAAAAAQAIAAIAPAAKAccBxgHFAh8CIAIhAiICIwIkAiUAAQAAAAEACAACABoACgI+AHoAcwB0Aj8CQAJBAkICQwJEAAIAAQAUAB0AAA==",
};
/*!
 Buttons for DataTables 1.7.1
 ©2016-2021 SpryMedia Ltd - datatables.net/license
*/
(function(e){"function"===typeof define&&define.amd?define(["jquery","datatables.net"],function(r){return e(r,window,document)}):"object"===typeof exports?module.exports=function(r,q){r||(r=window);if(!q||!q.fn.dataTable)q=require("datatables.net")(r,q).$;return e(q,r,r.document)}:e(jQuery,window,document)})(function(e,r,q,l){function t(a,b,c){e.fn.animate?a.stop().fadeIn(b,c):(a.css("display","block"),c&&c.call(a))}function u(a,b,c){e.fn.animate?a.stop().fadeOut(b,c):(a.css("display","none"),c&&
c.call(a))}function w(a,b){var c=new j.Api(a),d=b?b:c.init().buttons||j.defaults.buttons;return(new o(c,d)).container()}var j=e.fn.dataTable,z=0,A=0,p=j.ext.buttons,o=function(a,b){if(!(this instanceof o))return function(b){return(new o(b,a)).container()};"undefined"===typeof b&&(b={});!0===b&&(b={});Array.isArray(b)&&(b={buttons:b});this.c=e.extend(!0,{},o.defaults,b);b.buttons&&(this.c.buttons=b.buttons);this.s={dt:new j.Api(a),buttons:[],listenKeys:"",namespace:"dtb"+z++};this.dom={container:e("<"+
this.c.dom.container.tag+"/>").addClass(this.c.dom.container.className)};this._constructor()};e.extend(o.prototype,{action:function(a,b){var c=this._nodeToButton(a);if(b===l)return c.conf.action;c.conf.action=b;return this},active:function(a,b){var c=this._nodeToButton(a),d=this.c.dom.button.active,c=e(c.node);if(b===l)return c.hasClass(d);c.toggleClass(d,b===l?!0:b);return this},add:function(a,b){var c=this.s.buttons;if("string"===typeof b){for(var d=b.split("-"),e=this.s,c=0,h=d.length-1;c<h;c++)e=
e.buttons[1*d[c]];c=e.buttons;b=1*d[d.length-1]}this._expandButton(c,a,e!==l,b);this._draw();return this},container:function(){return this.dom.container},disable:function(a){a=this._nodeToButton(a);e(a.node).addClass(this.c.dom.button.disabled).attr("disabled",!0);return this},destroy:function(){e("body").off("keyup."+this.s.namespace);var a=this.s.buttons.slice(),b,c;b=0;for(c=a.length;b<c;b++)this.remove(a[b].node);this.dom.container.remove();a=this.s.dt.settings()[0];b=0;for(c=a.length;b<c;b++)if(a.inst===
this){a.splice(b,1);break}return this},enable:function(a,b){if(!1===b)return this.disable(a);var c=this._nodeToButton(a);e(c.node).removeClass(this.c.dom.button.disabled).removeAttr("disabled");return this},name:function(){return this.c.name},node:function(a){if(!a)return this.dom.container;a=this._nodeToButton(a);return e(a.node)},processing:function(a,b){var c=this.s.dt,d=this._nodeToButton(a);if(b===l)return e(d.node).hasClass("processing");e(d.node).toggleClass("processing",b);e(c.table().node()).triggerHandler("buttons-processing.dt",
[b,c.button(a),c,e(a),d.conf]);return this},remove:function(a){var b=this._nodeToButton(a),c=this._nodeToHost(a),d=this.s.dt;if(b.buttons.length)for(var f=b.buttons.length-1;0<=f;f--)this.remove(b.buttons[f].node);b.conf.destroy&&b.conf.destroy.call(d.button(a),d,e(a),b.conf);this._removeKey(b.conf);e(b.node).remove();a=e.inArray(b,c);c.splice(a,1);return this},text:function(a,b){var c=this._nodeToButton(a),d=this.c.dom.collection.buttonLiner,d=c.inCollection&&d&&d.tag?d.tag:this.c.dom.buttonLiner.tag,
f=this.s.dt,h=e(c.node),i=function(a){return"function"===typeof a?a(f,h,c.conf):a};if(b===l)return i(c.conf.text);c.conf.text=b;d?h.children(d).html(i(b)):h.html(i(b));return this},_constructor:function(){var a=this,b=this.s.dt,c=b.settings()[0],d=this.c.buttons;c._buttons||(c._buttons=[]);c._buttons.push({inst:this,name:this.c.name});for(var f=0,h=d.length;f<h;f++)this.add(d[f]);b.on("destroy",function(b,d){d===c&&a.destroy()});e("body").on("keyup."+this.s.namespace,function(b){if(!q.activeElement||
q.activeElement===q.body){var c=String.fromCharCode(b.keyCode).toLowerCase();a.s.listenKeys.toLowerCase().indexOf(c)!==-1&&a._keypress(c,b)}})},_addKey:function(a){a.key&&(this.s.listenKeys+=e.isPlainObject(a.key)?a.key.key:a.key)},_draw:function(a,b){a||(a=this.dom.container,b=this.s.buttons);a.children().detach();for(var c=0,d=b.length;c<d;c++)a.append(b[c].inserter),a.append(" "),b[c].buttons&&b[c].buttons.length&&this._draw(b[c].collection,b[c].buttons)},_expandButton:function(a,b,c,d){for(var f=
this.s.dt,h=0,b=!Array.isArray(b)?[b]:b,i=0,k=b.length;i<k;i++){var m=this._resolveExtends(b[i]);if(m)if(Array.isArray(m))this._expandButton(a,m,c,d);else{var g=this._buildButton(m,c);g&&(d!==l&&null!==d?(a.splice(d,0,g),d++):a.push(g),g.conf.buttons&&(g.collection=e("<"+this.c.dom.collection.tag+"/>"),g.conf._collection=g.collection,this._expandButton(g.buttons,g.conf.buttons,!0,d)),m.init&&m.init.call(f.button(g.node),f,e(g.node),m),h++)}}},_buildButton:function(a,b){var c=this.c.dom.button,d=this.c.dom.buttonLiner,
f=this.c.dom.collection,h=this.s.dt,i=function(b){return"function"===typeof b?b(h,g,a):b};b&&f.button&&(c=f.button);b&&f.buttonLiner&&(d=f.buttonLiner);if(a.available&&!a.available(h,a))return!1;var k=function(a,b,c,d){d.action.call(b.button(c),a,b,c,d);e(b.table().node()).triggerHandler("buttons-action.dt",[b.button(c),b,c,d])},f=a.tag||c.tag,m=a.clickBlurs===l?!0:a.clickBlurs,g=e("<"+f+"/>").addClass(c.className).attr("tabindex",this.s.dt.settings()[0].iTabIndex).attr("aria-controls",this.s.dt.table().node().id).on("click.dtb",
function(b){b.preventDefault();!g.hasClass(c.disabled)&&a.action&&k(b,h,g,a);m&&g.trigger("blur")}).on("keyup.dtb",function(b){b.keyCode===13&&!g.hasClass(c.disabled)&&a.action&&k(b,h,g,a)});"a"===f.toLowerCase()&&g.attr("href","#");"button"===f.toLowerCase()&&g.attr("type","button");d.tag?(f=e("<"+d.tag+"/>").html(i(a.text)).addClass(d.className),"a"===d.tag.toLowerCase()&&f.attr("href","#"),g.append(f)):g.html(i(a.text));!1===a.enabled&&g.addClass(c.disabled);a.className&&g.addClass(a.className);
a.titleAttr&&g.attr("title",i(a.titleAttr));a.attr&&g.attr(a.attr);a.namespace||(a.namespace=".dt-button-"+A++);d=(d=this.c.dom.buttonContainer)&&d.tag?e("<"+d.tag+"/>").addClass(d.className).append(g):g;this._addKey(a);this.c.buttonCreated&&(d=this.c.buttonCreated(a,d));return{conf:a,node:g.get(0),inserter:d,buttons:[],inCollection:b,collection:null}},_nodeToButton:function(a,b){b||(b=this.s.buttons);for(var c=0,d=b.length;c<d;c++){if(b[c].node===a)return b[c];if(b[c].buttons.length){var e=this._nodeToButton(a,
b[c].buttons);if(e)return e}}},_nodeToHost:function(a,b){b||(b=this.s.buttons);for(var c=0,d=b.length;c<d;c++){if(b[c].node===a)return b;if(b[c].buttons.length){var e=this._nodeToHost(a,b[c].buttons);if(e)return e}}},_keypress:function(a,b){if(!b._buttonsHandled){var c=function(d){for(var f=0,h=d.length;f<h;f++){var i=d[f].conf,k=d[f].node;if(i.key)if(i.key===a)b._buttonsHandled=!0,e(k).click();else if(e.isPlainObject(i.key)&&i.key.key===a&&(!i.key.shiftKey||b.shiftKey))if(!i.key.altKey||b.altKey)if(!i.key.ctrlKey||
b.ctrlKey)if(!i.key.metaKey||b.metaKey)b._buttonsHandled=!0,e(k).click();d[f].buttons.length&&c(d[f].buttons)}};c(this.s.buttons)}},_removeKey:function(a){if(a.key){var b=e.isPlainObject(a.key)?a.key.key:a.key,a=this.s.listenKeys.split(""),b=e.inArray(b,a);a.splice(b,1);this.s.listenKeys=a.join("")}},_resolveExtends:function(a){for(var b=this.s.dt,c,d,f=function(c){for(var d=0;!e.isPlainObject(c)&&!Array.isArray(c);){if(c===l)return;if("function"===typeof c){if(c=c(b,a),!c)return!1}else if("string"===
typeof c){if(!p[c])throw"Unknown button type: "+c;c=p[c]}d++;if(30<d)throw"Buttons: Too many iterations";}return Array.isArray(c)?c:e.extend({},c)},a=f(a);a&&a.extend;){if(!p[a.extend])throw"Cannot extend unknown button type: "+a.extend;var h=f(p[a.extend]);if(Array.isArray(h))return h;if(!h)return!1;c=h.className;a=e.extend({},h,a);c&&a.className!==c&&(a.className=c+" "+a.className);var i=a.postfixButtons;if(i){a.buttons||(a.buttons=[]);c=0;for(d=i.length;c<d;c++)a.buttons.push(i[c]);a.postfixButtons=
null}if(i=a.prefixButtons){a.buttons||(a.buttons=[]);c=0;for(d=i.length;c<d;c++)a.buttons.splice(c,0,i[c]);a.prefixButtons=null}a.extend=h.extend}return a},_popover:function(a,b,c){var d=this.c,f=e.extend({align:"button-left",autoClose:!1,background:!0,backgroundClassName:"dt-button-background",contentClassName:d.dom.collection.className,collectionLayout:"",collectionTitle:"",dropup:!1,fade:400,rightAlignClassName:"dt-button-right",tag:d.dom.collection.tag},c),h=b.node(),i=function(){u(e(".dt-button-collection"),
f.fade,function(){e(this).detach()});e(b.buttons('[aria-haspopup="true"][aria-expanded="true"]').nodes()).attr("aria-expanded","false");e("div.dt-button-background").off("click.dtb-collection");o.background(!1,f.backgroundClassName,f.fade,h);e("body").off(".dtb-collection");b.off("buttons-action.b-internal")};!1===a&&i();c=e(b.buttons('[aria-haspopup="true"][aria-expanded="true"]').nodes());c.length&&(h=c.eq(0),i());c=e("<div/>").addClass("dt-button-collection").addClass(f.collectionLayout).css("display",
"none");a=e(a).addClass(f.contentClassName).attr("role","menu").appendTo(c);h.attr("aria-expanded","true");h.parents("body")[0]!==q.body&&(h=q.body.lastChild);f.collectionTitle&&c.prepend('<div class="dt-button-collection-title">'+f.collectionTitle+"</div>");t(c.insertAfter(h),f.fade);var d=e(b.table().container()),k=c.css("position");"dt-container"===f.align&&(h=h.parent(),c.css("width",d.width()));if("absolute"===k){var m=h.position(),k=e(b.node()).position();c.css({top:k.top+h.outerHeight(),left:m.left});
var m=c.outerHeight(),g=d.offset().top+d.height(),g=k.top+h.outerHeight()+m-g,j=k.top-m,n=d.offset().top,k=k.top-m-5;(g>n-j||f.dropup)&&-k<n&&c.css("top",k);var k=d.offset().left,d=d.width(),d=k+d,m=c.offset().left,g=c.width(),g=m+g,j=h.offset().left,n=h.outerWidth(),l=j+n;c.hasClass(f.rightAlignClassName)||c.hasClass(f.leftAlignClassName)||"dt-container"===f.align?(n=0,c.hasClass(f.rightAlignClassName)?(n=l-g,k>m+n&&(k-=m+n,d-=g+n,n=k>d?n+d:n+k)):(n=k-m,d<g+n&&(k-=m+n,d-=g+n,n=k>d?n+d:n+k))):(d=
h.offset().top,n=0,n="button-right"===f.align?l-g:j-m);c.css("left",c.position().left+n)}else d=c.height()/2,d>e(r).height()/2&&(d=e(r).height()/2),c.css("marginTop",-1*d);f.background&&o.background(!0,f.backgroundClassName,f.fade,h);e("div.dt-button-background").on("click.dtb-collection",function(){});e("body").on("click.dtb-collection",function(b){var c=e.fn.addBack?"addBack":"andSelf",d=e(b.target).parent()[0];(!e(b.target).parents()[c]().filter(a).length&&!e(d).hasClass("dt-buttons")||e(b.target).hasClass("dt-button-background"))&&
i()}).on("keyup.dtb-collection",function(a){a.keyCode===27&&i()});f.autoClose&&setTimeout(function(){b.on("buttons-action.b-internal",function(a,b,c,d){d[0]!==h[0]&&i()})},0);e(c).trigger("buttons-popover.dt")}});o.background=function(a,b,c,d){c===l&&(c=400);d||(d=q.body);a?t(e("<div/>").addClass(b).css("display","none").insertAfter(d),c):u(e("div."+b),c,function(){e(this).removeClass(b).remove()})};o.instanceSelector=function(a,b){if(a===l||null===a)return e.map(b,function(a){return a.inst});var c=
[],d=e.map(b,function(a){return a.name}),f=function(a){if(Array.isArray(a))for(var i=0,k=a.length;i<k;i++)f(a[i]);else"string"===typeof a?-1!==a.indexOf(",")?f(a.split(",")):(a=e.inArray(a.trim(),d),-1!==a&&c.push(b[a].inst)):"number"===typeof a&&c.push(b[a].inst)};f(a);return c};o.buttonSelector=function(a,b){for(var c=[],d=function(a,b,c){for(var e,f,h=0,i=b.length;h<i;h++)if(e=b[h])f=c!==l?c+h:h+"",a.push({node:e.node,name:e.conf.name,idx:f}),e.buttons&&d(a,e.buttons,f+"-")},f=function(a,b){var g,
h,i=[];d(i,b.s.buttons);g=e.map(i,function(a){return a.node});if(Array.isArray(a)||a instanceof e){g=0;for(h=a.length;g<h;g++)f(a[g],b)}else if(null===a||a===l||"*"===a){g=0;for(h=i.length;g<h;g++)c.push({inst:b,node:i[g].node})}else if("number"===typeof a)c.push({inst:b,node:b.s.buttons[a].node});else if("string"===typeof a)if(-1!==a.indexOf(",")){i=a.split(",");g=0;for(h=i.length;g<h;g++)f(i[g].trim(),b)}else if(a.match(/^\d+(\-\d+)*$/))g=e.map(i,function(a){return a.idx}),c.push({inst:b,node:i[e.inArray(a,
g)].node});else if(-1!==a.indexOf(":name")){var j=a.replace(":name","");g=0;for(h=i.length;g<h;g++)i[g].name===j&&c.push({inst:b,node:i[g].node})}else e(g).filter(a).each(function(){c.push({inst:b,node:this})});else"object"===typeof a&&a.nodeName&&(i=e.inArray(a,g),-1!==i&&c.push({inst:b,node:g[i]}))},h=0,i=a.length;h<i;h++)f(b,a[h]);return c};o.stripData=function(a,b){if("string"!==typeof a)return a;a=a.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");a=a.replace(/<!\-\-.*?\-\->/g,
"");if(!b||b.stripHtml)a=a.replace(/<[^>]*>/g,"");if(!b||b.trim)a=a.replace(/^\s+|\s+$/g,"");if(!b||b.stripNewlines)a=a.replace(/\n/g," ");if(!b||b.decodeEntities)x.innerHTML=a,a=x.value;return a};o.defaults={buttons:["copy","excel","csv","pdf","print"],name:"main",tabIndex:0,dom:{container:{tag:"div",className:"dt-buttons"},collection:{tag:"div",className:""},button:{tag:"button",className:"dt-button",active:"active",disabled:"disabled"},buttonLiner:{tag:"span",className:""}}};o.version="1.7.1";
e.extend(p,{collection:{text:function(a){return a.i18n("buttons.collection","Collection")},className:"buttons-collection",init:function(a,b){b.attr("aria-expanded",!1)},action:function(a,b,c,d){a.stopPropagation();d._collection.parents("body").length?this.popover(!1,d):this.popover(d._collection,d)},attr:{"aria-haspopup":!0}},copy:function(){if(p.copyHtml5)return"copyHtml5"},csv:function(a,b){if(p.csvHtml5&&p.csvHtml5.available(a,b))return"csvHtml5"},excel:function(a,b){if(p.excelHtml5&&p.excelHtml5.available(a,
b))return"excelHtml5"},pdf:function(a,b){if(p.pdfHtml5&&p.pdfHtml5.available(a,b))return"pdfHtml5"},pageLength:function(a){var a=a.settings()[0].aLengthMenu,b=[],c=[];if(Array.isArray(a[0]))b=a[0],c=a[1];else for(var d=0;d<a.length;d++){var f=a[d];e.isPlainObject(f)?(b.push(f.value),c.push(f.label)):(b.push(f),c.push(f))}return{extend:"collection",text:function(a){return a.i18n("buttons.pageLength",{"-1":"Show all rows",_:"Show %d rows"},a.page.len())},className:"buttons-page-length",autoClose:!0,
buttons:e.map(b,function(a,b){return{text:c[b],className:"button-page-length",action:function(b,c){c.page.len(a).draw()},init:function(b,c,d){var e=this,c=function(){e.active(b.page.len()===a)};b.on("length.dt"+d.namespace,c);c()},destroy:function(a,b,c){a.off("length.dt"+c.namespace)}}}),init:function(a,b,c){var d=this;a.on("length.dt"+c.namespace,function(){d.text(c.text)})},destroy:function(a,b,c){a.off("length.dt"+c.namespace)}}}});j.Api.register("buttons()",function(a,b){b===l&&(b=a,a=l);this.selector.buttonGroup=
a;var c=this.iterator(!0,"table",function(c){if(c._buttons)return o.buttonSelector(o.instanceSelector(a,c._buttons),b)},!0);c._groupSelector=a;return c});j.Api.register("button()",function(a,b){var c=this.buttons(a,b);1<c.length&&c.splice(1,c.length);return c});j.Api.registerPlural("buttons().active()","button().active()",function(a){return a===l?this.map(function(a){return a.inst.active(a.node)}):this.each(function(b){b.inst.active(b.node,a)})});j.Api.registerPlural("buttons().action()","button().action()",
function(a){return a===l?this.map(function(a){return a.inst.action(a.node)}):this.each(function(b){b.inst.action(b.node,a)})});j.Api.register(["buttons().enable()","button().enable()"],function(a){return this.each(function(b){b.inst.enable(b.node,a)})});j.Api.register(["buttons().disable()","button().disable()"],function(){return this.each(function(a){a.inst.disable(a.node)})});j.Api.registerPlural("buttons().nodes()","button().node()",function(){var a=e();e(this.each(function(b){a=a.add(b.inst.node(b.node))}));
return a});j.Api.registerPlural("buttons().processing()","button().processing()",function(a){return a===l?this.map(function(a){return a.inst.processing(a.node)}):this.each(function(b){b.inst.processing(b.node,a)})});j.Api.registerPlural("buttons().text()","button().text()",function(a){return a===l?this.map(function(a){return a.inst.text(a.node)}):this.each(function(b){b.inst.text(b.node,a)})});j.Api.registerPlural("buttons().trigger()","button().trigger()",function(){return this.each(function(a){a.inst.node(a.node).trigger("click")})});
j.Api.register("button().popover()",function(a,b){return this.map(function(c){return c.inst._popover(a,this.button(this[0].node),b)})});j.Api.register("buttons().containers()",function(){var a=e(),b=this._groupSelector;this.iterator(!0,"table",function(c){if(c._buttons)for(var c=o.instanceSelector(b,c._buttons),d=0,e=c.length;d<e;d++)a=a.add(c[d].container())});return a});j.Api.register("buttons().container()",function(){return this.containers().eq(0)});j.Api.register("button().add()",function(a,
b){var c=this.context;c.length&&(c=o.instanceSelector(this._groupSelector,c[0]._buttons),c.length&&c[0].add(b,a));return this.button(this._groupSelector,a)});j.Api.register("buttons().destroy()",function(){this.pluck("inst").unique().each(function(a){a.destroy()});return this});j.Api.registerPlural("buttons().remove()","buttons().remove()",function(){this.each(function(a){a.inst.remove(a.node)});return this});var s;j.Api.register("buttons.info()",function(a,b,c){var d=this;if(!1===a)return this.off("destroy.btn-info"),
u(e("#datatables_buttons_info"),400,function(){e(this).remove()}),clearTimeout(s),s=null,this;s&&clearTimeout(s);e("#datatables_buttons_info").length&&e("#datatables_buttons_info").remove();t(e('<div id="datatables_buttons_info" class="dt-button-info"/>').html(a?"<h2>"+a+"</h2>":"").append(e("<div/>")["string"===typeof b?"html":"append"](b)).css("display","none").appendTo("body"));c!==l&&0!==c&&(s=setTimeout(function(){d.buttons.info(!1)},c));this.on("destroy.btn-info",function(){d.buttons.info(!1)});
return this});j.Api.register("buttons.exportData()",function(a){if(this.context.length){var b=new j.Api(this.context[0]),c=e.extend(!0,{},{rows:null,columns:"",modifier:{search:"applied",order:"applied"},orthogonal:"display",stripHtml:!0,stripNewlines:!0,decodeEntities:!0,trim:!0,format:{header:function(a){return o.stripData(a,c)},footer:function(a){return o.stripData(a,c)},body:function(a){return o.stripData(a,c)}},customizeData:null},a),a=b.columns(c.columns).indexes().map(function(a){var d=b.column(a).header();
return c.format.header(d.innerHTML,a,d)}).toArray(),d=b.table().footer()?b.columns(c.columns).indexes().map(function(a){var d=b.column(a).footer();return c.format.footer(d?d.innerHTML:"",a,d)}).toArray():null,f=e.extend({},c.modifier);b.select&&"function"===typeof b.select.info&&f.selected===l&&b.rows(c.rows,e.extend({selected:!0},f)).any()&&e.extend(f,{selected:!0});for(var f=b.rows(c.rows,f).indexes().toArray(),h=b.cells(f,c.columns),f=h.render(c.orthogonal).toArray(),h=h.nodes().toArray(),i=a.length,
k=[],m=0,g=0,q=0<i?f.length/i:0;g<q;g++){for(var n=[i],p=0;p<i;p++)n[p]=c.format.body(f[m],g,p,h[m]),m++;k[g]=n}a={header:a,footer:d,body:k};c.customizeData&&c.customizeData(a);return a}});j.Api.register("buttons.exportInfo()",function(a){a||(a={});var b;var c=a;b="*"===c.filename&&"*"!==c.title&&c.title!==l&&null!==c.title&&""!==c.title?c.title:c.filename;"function"===typeof b&&(b=b());b===l||null===b?b=null:(-1!==b.indexOf("*")&&(b=b.replace("*",e("head > title").text()).trim()),b=b.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g,
""),(c=v(c.extension))||(c=""),b+=c);c=v(a.title);c=null===c?null:-1!==c.indexOf("*")?c.replace("*",e("head > title").text()||"Exported data"):c;return{filename:b,title:c,messageTop:y(this,a.message||a.messageTop,"top"),messageBottom:y(this,a.messageBottom,"bottom")}});var v=function(a){return null===a||a===l?null:"function"===typeof a?a():a},y=function(a,b,c){b=v(b);if(null===b)return null;a=e("caption",a.table().container()).eq(0);return"*"===b?a.css("caption-side")!==c?null:a.length?a.text():"":
b},x=e("<textarea/>")[0];e.fn.dataTable.Buttons=o;e.fn.DataTable.Buttons=o;e(q).on("init.dt plugin-init.dt",function(a,b){if("dt"===a.namespace){var c=b.oInit.buttons||j.defaults.buttons;c&&!b._buttons&&(new o(b,c)).container()}});j.ext.feature.push({fnInit:w,cFeature:"B"});j.ext.features&&j.ext.features.register("buttons",w);return o});

/*!
 Bootstrap integration for DataTables' Buttons
 ©2016 SpryMedia Ltd - datatables.net/license
*/
(function(b){"function"===typeof define&&define.amd?define(["jquery","datatables.net-bs5","datatables.net-buttons"],function(a){return b(a,window,document)}):"object"===typeof exports?module.exports=function(a,c){a||(a=window);if(!c||!c.fn.dataTable)c=require("datatables.net-bs5")(a,c).$;c.fn.dataTable.Buttons||require("datatables.net-buttons")(a,c);return b(c,a,a.document)}:b(jQuery,window,document)})(function(b){var a=b.fn.dataTable;b.extend(!0,a.Buttons.defaults,{dom:{container:{className:"dt-buttons btn-group flex-wrap"},
button:{className:"btn btn-secondary"},collection:{tag:"div",className:"dropdown-menu",button:{tag:"a",className:"dt-button dropdown-item",active:"active",disabled:"disabled"}}},buttonCreated:function(a,d){return a.buttons?b('<div class="btn-group"/>').append(d):d}});a.ext.buttons.collection.className+=" dropdown-toggle";a.ext.buttons.collection.rightAlignClassName="dropdown-menu-right";return a.Buttons});

/*!
 * Column visibility buttons for Buttons and DataTables.
 * 2016 SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				$ = require('datatables.net')(root, $).$;
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;


$.extend( DataTable.ext.buttons, {
	// A collection of column visibility buttons
	colvis: function ( dt, conf ) {
		return {
			extend: 'collection',
			text: function ( dt ) {
				return dt.i18n( 'buttons.colvis', 'Column visibility' );
			},
			className: 'buttons-colvis',
			buttons: [ {
				extend: 'columnsToggle',
				columns: conf.columns,
				columnText: conf.columnText
			} ]
		};
	},

	// Selected columns with individual buttons - toggle column visibility
	columnsToggle: function ( dt, conf ) {
		var columns = dt.columns( conf.columns ).indexes().map( function ( idx ) {
			return {
				extend: 'columnToggle',
				columns: idx,
				columnText: conf.columnText
			};
		} ).toArray();

		return columns;
	},

	// Single button to toggle column visibility
	columnToggle: function ( dt, conf ) {
		return {
			extend: 'columnVisibility',
			columns: conf.columns,
			columnText: conf.columnText
		};
	},

	// Selected columns with individual buttons - set column visibility
	columnsVisibility: function ( dt, conf ) {
		var columns = dt.columns( conf.columns ).indexes().map( function ( idx ) {
			return {
				extend: 'columnVisibility',
				columns: idx,
				visibility: conf.visibility,
				columnText: conf.columnText
			};
		} ).toArray();

		return columns;
	},

	// Single button to set column visibility
	columnVisibility: {
		columns: undefined, // column selector
		text: function ( dt, button, conf ) {
			return conf._columnText( dt, conf );
		},
		className: 'buttons-columnVisibility',
		action: function ( e, dt, button, conf ) {
			var col = dt.columns( conf.columns );
			var curr = col.visible();

			col.visible( conf.visibility !== undefined ?
				conf.visibility :
				! (curr.length ? curr[0] : false )
			);
		},
		init: function ( dt, button, conf ) {
			var that = this;
			button.attr( 'data-cv-idx', conf.columns );

			dt
				.on( 'column-visibility.dt'+conf.namespace, function (e, settings) {
					if ( ! settings.bDestroying && settings.nTable == dt.settings()[0].nTable ) {
						that.active( dt.column( conf.columns ).visible() );
					}
				} )
				.on( 'column-reorder.dt'+conf.namespace, function (e, settings, details) {
					if ( dt.columns( conf.columns ).count() !== 1 ) {
						return;
					}

					// This button controls the same column index but the text for the column has
					// changed
					that.text( conf._columnText( dt, conf ) );

					// Since its a different column, we need to check its visibility
					that.active( dt.column( conf.columns ).visible() );
				} );

			this.active( dt.column( conf.columns ).visible() );
		},
		destroy: function ( dt, button, conf ) {
			dt
				.off( 'column-visibility.dt'+conf.namespace )
				.off( 'column-reorder.dt'+conf.namespace );
		},

		_columnText: function ( dt, conf ) {
			// Use DataTables' internal data structure until this is presented
			// is a public API. The other option is to use
			// `$( column(col).node() ).text()` but the node might not have been
			// populated when Buttons is constructed.
			var idx = dt.column( conf.columns ).index();
			var title = dt.settings()[0].aoColumns[ idx ].sTitle;

			if (! title) {
				title = dt.column(idx).header().innerHTML;
			}

			title = title
				.replace(/\n/g," ")        // remove new lines
				.replace(/<br\s*\/?>/gi, " ")  // replace line breaks with spaces
				.replace(/<select(.*?)<\/select>/g, "") // remove select tags, including options text
				.replace(/<!\-\-.*?\-\->/g, "") // strip HTML comments
				.replace(/<.*?>/g, "")   // strip HTML
				.replace(/^\s+|\s+$/g,""); // trim

			return conf.columnText ?
				conf.columnText( dt, idx, title ) :
				title;
		}
	},


	colvisRestore: {
		className: 'buttons-colvisRestore',

		text: function ( dt ) {
			return dt.i18n( 'buttons.colvisRestore', 'Restore visibility' );
		},

		init: function ( dt, button, conf ) {
			conf._visOriginal = dt.columns().indexes().map( function ( idx ) {
				return dt.column( idx ).visible();
			} ).toArray();
		},

		action: function ( e, dt, button, conf ) {
			dt.columns().every( function ( i ) {
				// Take into account that ColReorder might have disrupted our
				// indexes
				var idx = dt.colReorder && dt.colReorder.transpose ?
					dt.colReorder.transpose( i, 'toOriginal' ) :
					i;

				this.visible( conf._visOriginal[ idx ] );
			} );
		}
	},


	colvisGroup: {
		className: 'buttons-colvisGroup',

		action: function ( e, dt, button, conf ) {
			dt.columns( conf.show ).visible( true, false );
			dt.columns( conf.hide ).visible( false, false );

			dt.columns.adjust();
		},

		show: [],

		hide: []
	}
} );


return DataTable.Buttons;
}));

/*!
 * Flash export buttons for Buttons and DataTables.
 * 2015-2017 SpryMedia Ltd - datatables.net/license
 *
 * ZeroClipbaord - MIT license
 * Copyright (c) 2012 Joseph Huckaby
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				$ = require('datatables.net')(root, $).$;
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * ZeroClipboard dependency
 */

/*
 * ZeroClipboard 1.0.4 with modifications
 * Author: Joseph Huckaby
 * License: MIT
 *
 * Copyright (c) 2012 Joseph Huckaby
 */
var ZeroClipboard_TableTools = {
	version: "1.0.4-TableTools2",
	clients: {}, // registered upload clients on page, indexed by id
	moviePath: '', // URL to movie
	nextId: 1, // ID of next movie

	$: function(thingy) {
		// simple DOM lookup utility function
		if (typeof(thingy) == 'string') {
			thingy = document.getElementById(thingy);
		}
		if (!thingy.addClass) {
			// extend element with a few useful methods
			thingy.hide = function() { this.style.display = 'none'; };
			thingy.show = function() { this.style.display = ''; };
			thingy.addClass = function(name) { this.removeClass(name); this.className += ' ' + name; };
			thingy.removeClass = function(name) {
				this.className = this.className.replace( new RegExp("\\s*" + name + "\\s*"), " ").replace(/^\s+/, '').replace(/\s+$/, '');
			};
			thingy.hasClass = function(name) {
				return !!this.className.match( new RegExp("\\s*" + name + "\\s*") );
			};
		}
		return thingy;
	},

	setMoviePath: function(path) {
		// set path to ZeroClipboard.swf
		this.moviePath = path;
	},

	dispatch: function(id, eventName, args) {
		// receive event from flash movie, send to client
		var client = this.clients[id];
		if (client) {
			client.receiveEvent(eventName, args);
		}
	},

	log: function ( str ) {
		console.log( 'Flash: '+str );
	},

	register: function(id, client) {
		// register new client to receive events
		this.clients[id] = client;
	},

	getDOMObjectPosition: function(obj) {
		// get absolute coordinates for dom element
		var info = {
			left: 0,
			top: 0,
			width: obj.width ? obj.width : obj.offsetWidth,
			height: obj.height ? obj.height : obj.offsetHeight
		};

		if ( obj.style.width !== "" ) {
			info.width = obj.style.width.replace("px","");
		}

		if ( obj.style.height !== "" ) {
			info.height = obj.style.height.replace("px","");
		}

		while (obj) {
			info.left += obj.offsetLeft;
			info.top += obj.offsetTop;
			obj = obj.offsetParent;
		}

		return info;
	},

	Client: function(elem) {
		// constructor for new simple upload client
		this.handlers = {};

		// unique ID
		this.id = ZeroClipboard_TableTools.nextId++;
		this.movieId = 'ZeroClipboard_TableToolsMovie_' + this.id;

		// register client with singleton to receive flash events
		ZeroClipboard_TableTools.register(this.id, this);

		// create movie
		if (elem) {
			this.glue(elem);
		}
	}
};

ZeroClipboard_TableTools.Client.prototype = {

	id: 0, // unique ID for us
	ready: false, // whether movie is ready to receive events or not
	movie: null, // reference to movie object
	clipText: '', // text to copy to clipboard
	fileName: '', // default file save name
	action: 'copy', // action to perform
	handCursorEnabled: true, // whether to show hand cursor, or default pointer cursor
	cssEffects: true, // enable CSS mouse effects on dom container
	handlers: null, // user event handlers
	sized: false,
	sheetName: '', // default sheet name for excel export

	glue: function(elem, title) {
		// glue to DOM element
		// elem can be ID or actual DOM element object
		this.domElement = ZeroClipboard_TableTools.$(elem);

		// float just above object, or zIndex 99 if dom element isn't set
		var zIndex = 99;
		if (this.domElement.style.zIndex) {
			zIndex = parseInt(this.domElement.style.zIndex, 10) + 1;
		}

		// find X/Y position of domElement
		var box = ZeroClipboard_TableTools.getDOMObjectPosition(this.domElement);

		// create floating DIV above element
		this.div = document.createElement('div');
		var style = this.div.style;
		style.position = 'absolute';
		style.left = '0px';
		style.top = '0px';
		style.width = (box.width) + 'px';
		style.height = box.height + 'px';
		style.zIndex = zIndex;

		if ( typeof title != "undefined" && title !== "" ) {
			this.div.title = title;
		}
		if ( box.width !== 0 && box.height !== 0 ) {
			this.sized = true;
		}

		// style.backgroundColor = '#f00'; // debug
		if ( this.domElement ) {
			this.domElement.appendChild(this.div);
			this.div.innerHTML = this.getHTML( box.width, box.height ).replace(/&/g, '&amp;');
		}
	},

	positionElement: function() {
		var box = ZeroClipboard_TableTools.getDOMObjectPosition(this.domElement);
		var style = this.div.style;

		style.position = 'absolute';
		//style.left = (this.domElement.offsetLeft)+'px';
		//style.top = this.domElement.offsetTop+'px';
		style.width = box.width + 'px';
		style.height = box.height + 'px';

		if ( box.width !== 0 && box.height !== 0 ) {
			this.sized = true;
		} else {
			return;
		}

		var flash = this.div.childNodes[0];
		flash.width = box.width;
		flash.height = box.height;
	},

	getHTML: function(width, height) {
		// return HTML for movie
		var html = '';
		var flashvars = 'id=' + this.id +
			'&width=' + width +
			'&height=' + height;

		if (navigator.userAgent.match(/MSIE/)) {
			// IE gets an OBJECT tag
			var protocol = location.href.match(/^https/i) ? 'https://' : 'http://';
			html += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="'+protocol+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="'+width+'" height="'+height+'" id="'+this.movieId+'" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+ZeroClipboard_TableTools.moviePath+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+flashvars+'"/><param name="wmode" value="transparent"/></object>';
		}
		else {
			// all other browsers get an EMBED tag
			html += '<embed id="'+this.movieId+'" src="'+ZeroClipboard_TableTools.moviePath+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+width+'" height="'+height+'" name="'+this.movieId+'" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvars+'" wmode="transparent" />';
		}
		return html;
	},

	hide: function() {
		// temporarily hide floater offscreen
		if (this.div) {
			this.div.style.left = '-2000px';
		}
	},

	show: function() {
		// show ourselves after a call to hide()
		this.reposition();
	},

	destroy: function() {
		// destroy control and floater
		var that = this;

		if (this.domElement && this.div) {
			$(this.div).remove();

			this.domElement = null;
			this.div = null;

			$.each( ZeroClipboard_TableTools.clients, function ( id, client ) {
				if ( client === that ) {
					delete ZeroClipboard_TableTools.clients[ id ];
				}
			} );
		}
	},

	reposition: function(elem) {
		// reposition our floating div, optionally to new container
		// warning: container CANNOT change size, only position
		if (elem) {
			this.domElement = ZeroClipboard_TableTools.$(elem);
			if (!this.domElement) {
				this.hide();
			}
		}

		if (this.domElement && this.div) {
			var box = ZeroClipboard_TableTools.getDOMObjectPosition(this.domElement);
			var style = this.div.style;
			style.left = '' + box.left + 'px';
			style.top = '' + box.top + 'px';
		}
	},

	clearText: function() {
		// clear the text to be copy / saved
		this.clipText = '';
		if (this.ready) {
			this.movie.clearText();
		}
	},

	appendText: function(newText) {
		// append text to that which is to be copied / saved
		this.clipText += newText;
		if (this.ready) { this.movie.appendText(newText) ;}
	},

	setText: function(newText) {
		// set text to be copied to be copied / saved
		this.clipText = newText;
		if (this.ready) { this.movie.setText(newText) ;}
	},

	setFileName: function(newText) {
		// set the file name
		this.fileName = newText;
		if (this.ready) {
			this.movie.setFileName(newText);
		}
	},

	setSheetData: function(data) {
		// set the xlsx sheet data
		if (this.ready) {
			this.movie.setSheetData( JSON.stringify( data ) );
		}
	},

	setAction: function(newText) {
		// set action (save or copy)
		this.action = newText;
		if (this.ready) {
			this.movie.setAction(newText);
		}
	},

	addEventListener: function(eventName, func) {
		// add user event listener for event
		// event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
		eventName = eventName.toString().toLowerCase().replace(/^on/, '');
		if (!this.handlers[eventName]) {
			this.handlers[eventName] = [];
		}
		this.handlers[eventName].push(func);
	},

	setHandCursor: function(enabled) {
		// enable hand cursor (true), or default arrow cursor (false)
		this.handCursorEnabled = enabled;
		if (this.ready) {
			this.movie.setHandCursor(enabled);
		}
	},

	setCSSEffects: function(enabled) {
		// enable or disable CSS effects on DOM container
		this.cssEffects = !!enabled;
	},

	receiveEvent: function(eventName, args) {
		var self;

		// receive event from flash
		eventName = eventName.toString().toLowerCase().replace(/^on/, '');

		// special behavior for certain events
		switch (eventName) {
			case 'load':
				// movie claims it is ready, but in IE this isn't always the case...
				// bug fix: Cannot extend EMBED DOM elements in Firefox, must use traditional function
				this.movie = document.getElementById(this.movieId);
				if (!this.movie) {
					self = this;
					setTimeout( function() { self.receiveEvent('load', null); }, 1 );
					return;
				}

				// firefox on pc needs a "kick" in order to set these in certain cases
				if (!this.ready && navigator.userAgent.match(/Firefox/) && navigator.userAgent.match(/Windows/)) {
					self = this;
					setTimeout( function() { self.receiveEvent('load', null); }, 100 );
					this.ready = true;
					return;
				}

				this.ready = true;
				this.movie.clearText();
				this.movie.appendText( this.clipText );
				this.movie.setFileName( this.fileName );
				this.movie.setAction( this.action );
				this.movie.setHandCursor( this.handCursorEnabled );
				break;

			case 'mouseover':
				if (this.domElement && this.cssEffects) {
					//this.domElement.addClass('hover');
					if (this.recoverActive) {
						this.domElement.addClass('active');
					}
				}
				break;

			case 'mouseout':
				if (this.domElement && this.cssEffects) {
					this.recoverActive = false;
					if (this.domElement.hasClass('active')) {
						this.domElement.removeClass('active');
						this.recoverActive = true;
					}
					//this.domElement.removeClass('hover');
				}
				break;

			case 'mousedown':
				if (this.domElement && this.cssEffects) {
					this.domElement.addClass('active');
				}
				break;

			case 'mouseup':
				if (this.domElement && this.cssEffects) {
					this.domElement.removeClass('active');
					this.recoverActive = false;
				}
				break;
		} // switch eventName

		if (this.handlers[eventName]) {
			for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
				var func = this.handlers[eventName][idx];

				if (typeof(func) == 'function') {
					// actual function reference
					func(this, args);
				}
				else if ((typeof(func) == 'object') && (func.length == 2)) {
					// PHP style object + method, i.e. [myObject, 'myMethod']
					func[0][ func[1] ](this, args);
				}
				else if (typeof(func) == 'string') {
					// name of function
					window[func](this, args);
				}
			} // foreach event handler defined
		} // user defined handler for event
	}
};

ZeroClipboard_TableTools.hasFlash = function ()
{
	try {
		var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
		if (fo) {
			return true;
		}
	}
	catch (e) {
		if (
			navigator.mimeTypes &&
			navigator.mimeTypes['application/x-shockwave-flash'] !== undefined &&
			navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin
		) {
			return true;
		}
	}

	return false;
};

// For the Flash binding to work, ZeroClipboard_TableTools must be on the global
// object list
window.ZeroClipboard_TableTools = ZeroClipboard_TableTools;



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Local (private) functions
 */

/**
 * If a Buttons instance is initlaised before it is placed into the DOM, Flash
 * won't be able to bind to it, so we need to wait until it is available, this
 * method abstracts that out.
 *
 * @param {ZeroClipboard} flash ZeroClipboard instance
 * @param {jQuery} node  Button
 */
var _glue = function ( flash, node )
{
	var id = node.attr('id');

	if ( node.parents('html').length ) {
		flash.glue( node[0], '' );
	}
	else {
		setTimeout( function () {
			_glue( flash, node );
		}, 500 );
	}
};

/**
 * Get the sheet name for Excel exports.
 *
 * @param {object}  config       Button configuration
 */
var _sheetname = function ( config )
{
	var sheetName = 'Sheet1';

	if ( config.sheetName ) {
		sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
	}

	return sheetName;
};

/**
 * Set the flash text. This has to be broken up into chunks as the Javascript /
 * Flash bridge has a size limit. There is no indication in the Flash
 * documentation what this is, and it probably depends upon the browser.
 * Experimentation shows that the point is around 50k when data starts to get
 * lost, so an 8K limit used here is safe.
 *
 * @param {ZeroClipboard} flash ZeroClipboard instance
 * @param {string}        data  Data to send to Flash
 */
var _setText = function ( flash, data )
{
	var parts = data.match(/[\s\S]{1,8192}/g) || [];

	flash.clearText();
	for ( var i=0, len=parts.length ; i<len ; i++ )
	{
		flash.appendText( parts[i] );
	}
};

/**
 * Get the newline character(s)
 *
 * @param {object}  config Button configuration
 * @return {string}        Newline character
 */
var _newLine = function ( config )
{
	return config.newline ?
		config.newline :
		navigator.userAgent.match(/Windows/) ?
			'\r\n' :
			'\n';
};

/**
 * Combine the data from the `buttons.exportData` method into a string that
 * will be used in the export file.
 *
 * @param  {DataTable.Api} dt     DataTables API instance
 * @param  {object}        config Button configuration
 * @return {object}               The data to export
 */
var _exportData = function ( dt, config )
{
	var newLine = _newLine( config );
	var data = dt.buttons.exportData( config.exportOptions );
	var boundary = config.fieldBoundary;
	var separator = config.fieldSeparator;
	var reBoundary = new RegExp( boundary, 'g' );
	var escapeChar = config.escapeChar !== undefined ?
		config.escapeChar :
		'\\';
	var join = function ( a ) {
		var s = '';

		// If there is a field boundary, then we might need to escape it in
		// the source data
		for ( var i=0, ien=a.length ; i<ien ; i++ ) {
			if ( i > 0 ) {
				s += separator;
			}

			s += boundary ?
				boundary + ('' + a[i]).replace( reBoundary, escapeChar+boundary ) + boundary :
				a[i];
		}

		return s;
	};

	var header = config.header ? join( data.header )+newLine : '';
	var footer = config.footer && data.footer ? newLine+join( data.footer ) : '';
	var body = [];

	for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
		body.push( join( data.body[i] ) );
	}

	return {
		str: header + body.join( newLine ) + footer,
		rows: body.length
	};
};


// Basic initialisation for the buttons is common between them
var flashButton = {
	available: function () {
		return ZeroClipboard_TableTools.hasFlash();
	},

	init: function ( dt, button, config ) {
		// Insert the Flash movie
		ZeroClipboard_TableTools.moviePath = DataTable.Buttons.swfPath;
		var flash = new ZeroClipboard_TableTools.Client();

		flash.setHandCursor( true );
		flash.addEventListener('mouseDown', function(client) {
			config._fromFlash = true;
			dt.button( button[0] ).trigger();
			config._fromFlash = false;
		} );

		_glue( flash, button );

		config._flash = flash;
	},

	destroy: function ( dt, button, config ) {
		config._flash.destroy();
	},

	fieldSeparator: ',',

	fieldBoundary: '"',

	exportOptions: {},

	title: '*',

	messageTop: '*',

	messageBottom: '*',

	filename: '*',

	extension: '.csv',

	header: true,

	footer: false
};


/**
 * Convert from numeric position to letter for column names in Excel
 * @param  {int} n Column number
 * @return {string} Column letter(s) name
 */
function createCellPos( n ){
	var ordA = 'A'.charCodeAt(0);
	var ordZ = 'Z'.charCodeAt(0);
	var len = ordZ - ordA + 1;
	var s = "";

	while( n >= 0 ) {
		s = String.fromCharCode(n % len + ordA) + s;
		n = Math.floor(n / len) - 1;
	}

	return s;
}

/**
 * Create an XML node and add any children, attributes, etc without needing to
 * be verbose in the DOM.
 *
 * @param  {object} doc      XML document
 * @param  {string} nodeName Node name
 * @param  {object} opts     Options - can be `attr` (attributes), `children`
 *   (child nodes) and `text` (text content)
 * @return {node}            Created node
 */
function _createNode( doc, nodeName, opts ){
	var tempNode = doc.createElement( nodeName );

	if ( opts ) {
		if ( opts.attr ) {
			$(tempNode).attr( opts.attr );
		}

		if ( opts.children ) {
			$.each( opts.children, function ( key, value ) {
				tempNode.appendChild( value );
			} );
		}

		if ( opts.text !== null && opts.text !== undefined ) {
			tempNode.appendChild( doc.createTextNode( opts.text ) );
		}
	}

	return tempNode;
}

/**
 * Get the width for an Excel column based on the contents of that column
 * @param  {object} data Data for export
 * @param  {int}    col  Column index
 * @return {int}         Column width
 */
function _excelColWidth( data, col ) {
	var max = data.header[col].length;
	var len, lineSplit, str;

	if ( data.footer && data.footer[col].length > max ) {
		max = data.footer[col].length;
	}

	for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
		var point = data.body[i][col];
		str = point !== null && point !== undefined ?
			point.toString() :
			'';

		// If there is a newline character, workout the width of the column
		// based on the longest line in the string
		if ( str.indexOf('\n') !== -1 ) {
			lineSplit = str.split('\n');
			lineSplit.sort( function (a, b) {
				return b.length - a.length;
			} );

			len = lineSplit[0].length;
		}
		else {
			len = str.length;
		}

		if ( len > max ) {
			max = len;
		}

		// Max width rather than having potentially massive column widths
		if ( max > 40 ) {
			return 52; // 40 * 1.3
		}
	}

	max *= 1.3;

	// And a min width
	return max > 6 ? max : 6;
}

  var _serialiser = "";
    if (typeof window.XMLSerializer === 'undefined') {
        _serialiser = new function () {
            this.serializeToString = function (input) {
                return input.xml
            }
        };
    } else {
        _serialiser =  new XMLSerializer();
    }

    var _ieExcel;


/**
 * Convert XML documents in an object to strings
 * @param  {object} obj XLSX document object
 */
function _xlsxToStrings( obj ) {
	if ( _ieExcel === undefined ) {
		// Detect if we are dealing with IE's _awful_ serialiser by seeing if it
		// drop attributes
		_ieExcel = _serialiser
			.serializeToString(
				$.parseXML( excelStrings['xl/worksheets/sheet1.xml'] )
			)
			.indexOf( 'xmlns:r' ) === -1;
	}

	$.each( obj, function ( name, val ) {
		if ( $.isPlainObject( val ) ) {
			_xlsxToStrings( val );
		}
		else {
			if ( _ieExcel ) {
				// IE's XML serialiser will drop some name space attributes from
				// from the root node, so we need to save them. Do this by
				// replacing the namespace nodes with a regular attribute that
				// we convert back when serialised. Edge does not have this
				// issue
				var worksheet = val.childNodes[0];
				var i, ien;
				var attrs = [];

				for ( i=worksheet.attributes.length-1 ; i>=0 ; i-- ) {
					var attrName = worksheet.attributes[i].nodeName;
					var attrValue = worksheet.attributes[i].nodeValue;

					if ( attrName.indexOf( ':' ) !== -1 ) {
						attrs.push( { name: attrName, value: attrValue } );

						worksheet.removeAttribute( attrName );
					}
				}

				for ( i=0, ien=attrs.length ; i<ien ; i++ ) {
					var attr = val.createAttribute( attrs[i].name.replace( ':', '_dt_b_namespace_token_' ) );
					attr.value = attrs[i].value;
					worksheet.setAttributeNode( attr );
				}
			}

			var str = _serialiser.serializeToString(val);

			// Fix IE's XML
			if ( _ieExcel ) {
				// IE doesn't include the XML declaration
				if ( str.indexOf( '<?xml' ) === -1 ) {
					str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+str;
				}

				// Return namespace attributes to being as such
				str = str.replace( /_dt_b_namespace_token_/g, ':' );
			}

			// Safari, IE and Edge will put empty name space attributes onto
			// various elements making them useless. This strips them out
			str = str.replace( /<([^<>]*?) xmlns=""([^<>]*?)>/g, '<$1 $2>' );

			obj[ name ] = str;
		}
	} );
}

// Excel - Pre-defined strings to build a basic XLSX file
var excelStrings = {
	"_rels/.rels":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
			'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'+
		'</Relationships>',

	"xl/_rels/workbook.xml.rels":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
			'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'+
			'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'+
		'</Relationships>',

	"[Content_Types].xml":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
			'<Default Extension="xml" ContentType="application/xml" />'+
			'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />'+
			'<Default Extension="jpeg" ContentType="image/jpeg" />'+
			'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />'+
			'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />'+
			'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />'+
		'</Types>',

	"xl/workbook.xml":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
			'<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>'+
			'<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>'+
			'<bookViews>'+
				'<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>'+
			'</bookViews>'+
			'<sheets>'+
				'<sheet name="" sheetId="1" r:id="rId1"/>'+
			'</sheets>'+
		'</workbook>',

	"xl/worksheets/sheet1.xml":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+
			'<sheetData/>'+
			'<mergeCells count="0"/>'+
		'</worksheet>',

	"xl/styles.xml":
		'<?xml version="1.0" encoding="UTF-8"?>'+
		'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+
			'<numFmts count="6">'+
				'<numFmt numFmtId="164" formatCode="#,##0.00_-\ [$$-45C]"/>'+
				'<numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/>'+
				'<numFmt numFmtId="166" formatCode="[$€-2]\ #,##0.00"/>'+
				'<numFmt numFmtId="167" formatCode="0.0%"/>'+
				'<numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/>'+
				'<numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/>'+
			'</numFmts>'+
			'<fonts count="5" x14ac:knownFonts="1">'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
				'</font>'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
					'<color rgb="FFFFFFFF" />'+
				'</font>'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
					'<b />'+
				'</font>'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
					'<i />'+
				'</font>'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
					'<u />'+
				'</font>'+
			'</fonts>'+
			'<fills count="6">'+
				'<fill>'+
					'<patternFill patternType="none" />'+
				'</fill>'+
				'<fill>'+ // Excel appears to use this as a dotted background regardless of values but
					'<patternFill patternType="none" />'+ // to be valid to the schema, use a patternFill
				'</fill>'+
				'<fill>'+
					'<patternFill patternType="solid">'+
						'<fgColor rgb="FFD9D9D9" />'+
						'<bgColor indexed="64" />'+
					'</patternFill>'+
				'</fill>'+
				'<fill>'+
					'<patternFill patternType="solid">'+
						'<fgColor rgb="FFD99795" />'+
						'<bgColor indexed="64" />'+
					'</patternFill>'+
				'</fill>'+
				'<fill>'+
					'<patternFill patternType="solid">'+
						'<fgColor rgb="ffc6efce" />'+
						'<bgColor indexed="64" />'+
					'</patternFill>'+
				'</fill>'+
				'<fill>'+
					'<patternFill patternType="solid">'+
						'<fgColor rgb="ffc6cfef" />'+
						'<bgColor indexed="64" />'+
					'</patternFill>'+
				'</fill>'+
			'</fills>'+
			'<borders count="2">'+
				'<border>'+
					'<left />'+
					'<right />'+
					'<top />'+
					'<bottom />'+
					'<diagonal />'+
				'</border>'+
				'<border diagonalUp="false" diagonalDown="false">'+
					'<left style="thin">'+
						'<color auto="1" />'+
					'</left>'+
					'<right style="thin">'+
						'<color auto="1" />'+
					'</right>'+
					'<top style="thin">'+
						'<color auto="1" />'+
					'</top>'+
					'<bottom style="thin">'+
						'<color auto="1" />'+
					'</bottom>'+
					'<diagonal />'+
				'</border>'+
			'</borders>'+
			'<cellStyleXfs count="1">'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />'+
			'</cellStyleXfs>'+
			'<cellXfs count="61">'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment horizontal="left"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment horizontal="center"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment horizontal="right"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment horizontal="fill"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment textRotation="90"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment wrapText="1"/>'+
				'</xf>'+
				'<xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
			'</cellXfs>'+
			'<cellStyles count="1">'+
				'<cellStyle name="Normal" xfId="0" builtinId="0" />'+
			'</cellStyles>'+
			'<dxfs count="0" />'+
			'<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" />'+
		'</styleSheet>'
};
// Note we could use 3 `for` loops for the styles, but when gzipped there is
// virtually no difference in size, since the above can be easily compressed

// Pattern matching for special number formats. Perhaps this should be exposed
// via an API in future?
var _excelSpecials = [
	{ match: /^\-?\d+\.\d%$/,       style: 60, fmt: function (d) { return d/100; } }, // Precent with d.p.
	{ match: /^\-?\d+\.?\d*%$/,     style: 56, fmt: function (d) { return d/100; } }, // Percent
	{ match: /^\-?\$[\d,]+.?\d*$/,  style: 57 }, // Dollars
	{ match: /^\-?£[\d,]+.?\d*$/,   style: 58 }, // Pounds
	{ match: /^\-?€[\d,]+.?\d*$/,   style: 59 }, // Euros
	{ match: /^\([\d,]+\)$/,        style: 61, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets
	{ match: /^\([\d,]+\.\d{2}\)$/, style: 62, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets - 2d.p.
	{ match: /^[\d,]+$/,            style: 63 }, // Numbers with thousand separators
	{ match: /^[\d,]+\.\d{2}$/,     style: 64 }  // Numbers with 2d.p. and thousands separators
];



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables options and methods
 */

// Set the default SWF path
DataTable.Buttons.swfPath = '//cdn.datatables.net/buttons/'+DataTable.Buttons.version+'/swf/flashExport.swf';

// Method to allow Flash buttons to be resized when made visible - as they are
// of zero height and width if initialised hidden
DataTable.Api.register( 'buttons.resize()', function () {
	$.each( ZeroClipboard_TableTools.clients, function ( i, client ) {
		if ( client.domElement !== undefined && client.domElement.parentNode ) {
			client.positionElement();
		}
	} );
} );


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Button definitions
 */

// Copy to clipboard
DataTable.ext.buttons.copyFlash = $.extend( {}, flashButton, {
	className: 'buttons-copy buttons-flash',

	text: function ( dt ) {
		return dt.i18n( 'buttons.copy', 'Copy' );
	},

	action: function ( e, dt, button, config ) {
		// Check that the trigger did actually occur due to a Flash activation
		if ( ! config._fromFlash ) {
			return;
		}

		this.processing( true );

		var flash = config._flash;
		var exportData = _exportData( dt, config );
		var info = dt.buttons.exportInfo( config );
		var newline = _newLine(config);
		var output = exportData.str;

		if ( info.title ) {
			output = info.title + newline + newline + output;
		}

		if ( info.messageTop ) {
			output = info.messageTop + newline + newline + output;
		}

		if ( info.messageBottom ) {
			output = output + newline + newline + info.messageBottom;
		}

		if ( config.customize ) {
			output = config.customize( output, config, dt );
		}

		flash.setAction( 'copy' );
		_setText( flash, output );

		this.processing( false );

		dt.buttons.info(
			dt.i18n( 'buttons.copyTitle', 'Copy to clipboard' ),
			dt.i18n( 'buttons.copySuccess', {
				_: 'Copied %d rows to clipboard',
				1: 'Copied 1 row to clipboard'
			}, data.rows ),
			3000
		);
	},

	fieldSeparator: '\t',

	fieldBoundary: ''
} );

// CSV save file
DataTable.ext.buttons.csvFlash = $.extend( {}, flashButton, {
	className: 'buttons-csv buttons-flash',

	text: function ( dt ) {
		return dt.i18n( 'buttons.csv', 'CSV' );
	},

	action: function ( e, dt, button, config ) {
		// Set the text
		var flash = config._flash;
		var data = _exportData( dt, config );
		var info = dt.buttons.exportInfo( config );
		var output = config.customize ?
			config.customize( data.str, config, dt ) :
			data.str;

		flash.setAction( 'csv' );
		flash.setFileName( info.filename );
		_setText( flash, output );
	},

	escapeChar: '"'
} );

// Excel save file - this is really a CSV file using UTF-8 that Excel can read
DataTable.ext.buttons.excelFlash = $.extend( {}, flashButton, {
	className: 'buttons-excel buttons-flash',

	text: function ( dt ) {
		return dt.i18n( 'buttons.excel', 'Excel' );
	},

	action: function ( e, dt, button, config ) {
		this.processing( true );

		var flash = config._flash;
		var rowPos = 0;
		var rels = $.parseXML( excelStrings['xl/worksheets/sheet1.xml'] ) ; //Parses xml
		var relsGet = rels.getElementsByTagName( "sheetData" )[0];

		var xlsx = {
			_rels: {
				".rels": $.parseXML( excelStrings['_rels/.rels'] )
			},
			xl: {
				_rels: {
					"workbook.xml.rels": $.parseXML( excelStrings['xl/_rels/workbook.xml.rels'] )
				},
				"workbook.xml": $.parseXML( excelStrings['xl/workbook.xml'] ),
				"styles.xml": $.parseXML( excelStrings['xl/styles.xml'] ),
				"worksheets": {
					"sheet1.xml": rels
				}

			},
			"[Content_Types].xml": $.parseXML( excelStrings['[Content_Types].xml'])
		};

		var data = dt.buttons.exportData( config.exportOptions );
		var currentRow, rowNode;
		var addRow = function ( row ) {
			currentRow = rowPos+1;
			rowNode = _createNode( rels, "row", { attr: {r:currentRow} } );

			for ( var i=0, ien=row.length ; i<ien ; i++ ) {
				// Concat both the Cell Columns as a letter and the Row of the cell.
				var cellId = createCellPos(i) + '' + currentRow;
				var cell = null;

				// For null, undefined of blank cell, continue so it doesn't create the _createNode
				if ( row[i] === null || row[i] === undefined || row[i] === '' ) {
					if ( config.createEmptyCells === true ) {
						row[i] = '';
					}
					else {
						continue;
					}
				}

				row[i] = typeof row[i].trim === 'function'
					? row[i].trim()
					: row[i];

				// Special number formatting options
				for ( var j=0, jen=_excelSpecials.length ; j<jen ; j++ ) {
					var special = _excelSpecials[j];

					// TODO Need to provide the ability for the specials to say
					// if they are returning a string, since at the moment it is
					// assumed to be a number
					if ( row[i].match && ! row[i].match(/^0\d+/) && row[i].match( special.match ) ) {
						var val = row[i].replace(/[^\d\.\-]/g, '');

						if ( special.fmt ) {
							val = special.fmt( val );
						}

						cell = _createNode( rels, 'c', {
							attr: {
								r: cellId,
								s: special.style
							},
							children: [
								_createNode( rels, 'v', { text: val } )
							]
						} );

						break;
					}
				}

				if ( ! cell ) {
					if ( typeof row[i] === 'number' || (
						row[i].match &&
						row[i].match(/^-?\d+(\.\d+)?$/) &&
						! row[i].match(/^0\d+/) )
					) {
						// Detect numbers - don't match numbers with leading zeros
						// or a negative anywhere but the start
						cell = _createNode( rels, 'c', {
							attr: {
								t: 'n',
								r: cellId
							},
							children: [
								_createNode( rels, 'v', { text: row[i] } )
							]
						} );
					}
					else {
						// String output - replace non standard characters for text output
						var text = ! row[i].replace ?
							row[i] :
							row[i].replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

						cell = _createNode( rels, 'c', {
							attr: {
								t: 'inlineStr',
								r: cellId
							},
							children:{
								row: _createNode( rels, 'is', {
									children: {
										row: _createNode( rels, 't', {
											text: text
										} )
									}
								} )
							}
						} );
					}
				}

				rowNode.appendChild( cell );
			}

			relsGet.appendChild(rowNode);
			rowPos++;
		};

		$( 'sheets sheet', xlsx.xl['workbook.xml'] ).attr( 'name', _sheetname( config ) );

		if ( config.customizeData ) {
			config.customizeData( data );
		}

		var mergeCells = function ( row, colspan ) {
			var mergeCells = $('mergeCells', rels);

			mergeCells[0].appendChild( _createNode( rels, 'mergeCell', {
				attr: {
					ref: 'A'+row+':'+createCellPos(colspan)+row
				}
			} ) );
			mergeCells.attr( 'count', mergeCells.attr( 'count' )+1 );
			$('row:eq('+(row-1)+') c', rels).attr( 's', '51' ); // centre
		};

		// Title and top messages
		var exportInfo = dt.buttons.exportInfo( config );
		if ( exportInfo.title ) {
			addRow( [exportInfo.title], rowPos );
			mergeCells( rowPos, data.header.length-1 );
		}

		if ( exportInfo.messageTop ) {
			addRow( [exportInfo.messageTop], rowPos );
			mergeCells( rowPos, data.header.length-1 );
		}

		// Table itself
		if ( config.header ) {
			addRow( data.header, rowPos );
			$('row:last c', rels).attr( 's', '2' ); // bold
		}

		for ( var n=0, ie=data.body.length ; n<ie ; n++ ) {
			addRow( data.body[n], rowPos );
		}

		if ( config.footer && data.footer ) {
			addRow( data.footer, rowPos);
			$('row:last c', rels).attr( 's', '2' ); // bold
		}

		// Below the table
		if ( exportInfo.messageBottom ) {
			addRow( [exportInfo.messageBottom], rowPos );
			mergeCells( rowPos, data.header.length-1 );
		}

		// Set column widths
		var cols = _createNode( rels, 'cols' );
		$('worksheet', rels).prepend( cols );

		for ( var i=0, ien=data.header.length ; i<ien ; i++ ) {
			cols.appendChild( _createNode( rels, 'col', {
				attr: {
					min: i+1,
					max: i+1,
					width: _excelColWidth( data, i ),
					customWidth: 1
				}
			} ) );
		}

		// Let the developer customise the document if they want to
		if ( config.customize ) {
			config.customize( xlsx, config, dt );
		}

		_xlsxToStrings( xlsx );

		flash.setAction( 'excel' );
		flash.setFileName( exportInfo.filename );
		flash.setSheetData( xlsx );
		_setText( flash, '' );

		this.processing( false );
	},

	extension: '.xlsx',
	
	createEmptyCells: false
} );



// PDF export
DataTable.ext.buttons.pdfFlash = $.extend( {}, flashButton, {
	className: 'buttons-pdf buttons-flash',

	text: function ( dt ) {
		return dt.i18n( 'buttons.pdf', 'PDF' );
	},

	action: function ( e, dt, button, config ) {
		this.processing( true );

		// Set the text
		var flash = config._flash;
		var data = dt.buttons.exportData( config.exportOptions );
		var info = dt.buttons.exportInfo( config );
		var totalWidth = dt.table().node().offsetWidth;

		// Calculate the column width ratios for layout of the table in the PDF
		var ratios = dt.columns( config.columns ).indexes().map( function ( idx ) {
			return dt.column( idx ).header().offsetWidth / totalWidth;
		} );

		flash.setAction( 'pdf' );
		flash.setFileName( info.filename );

		_setText( flash, JSON.stringify( {
			title:         info.title || '',
			messageTop:    info.messageTop || '',
			messageBottom: info.messageBottom || '',
			colWidth:      ratios.toArray(),
			orientation:   config.orientation,
			size:          config.pageSize,
			header:        config.header ? data.header : null,
			footer:        config.footer ? data.footer : null,
			body:          data.body
		} ) );

		this.processing( false );
	},

	extension: '.pdf',

	orientation: 'portrait',

	pageSize: 'A4',

	newline: '\n'
} );


return DataTable.Buttons;
}));

/*!
 * HTML5 export buttons for Buttons and DataTables.
 * 2016 SpryMedia Ltd - datatables.net/license
 *
 * FileSaver.js (1.3.3) - MIT license
 * Copyright © 2016 Eli Grey - http://eligrey.com
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $, jszip, pdfmake) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				$ = require('datatables.net')(root, $).$;
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}

			return factory( $, root, root.document, jszip, pdfmake );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document, jszip, pdfmake, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;

// Allow the constructor to pass in JSZip and PDFMake from external requires.
// Otherwise, use globally defined variables, if they are available.
function _jsZip () {
	return jszip || window.JSZip;
}
function _pdfMake () {
	return pdfmake || window.pdfMake;
}

DataTable.Buttons.pdfMake = function (_) {
	if ( ! _ ) {
		return _pdfMake();
	}
	pdfmake = _;
}

DataTable.Buttons.jszip = function (_) {
	if ( ! _ ) {
		return _jsZip();
	}
	jszip = _;
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FileSaver.js dependency
 */

/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

var _saveAs = (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));


// Expose file saver on the DataTables API. Can't attach to `DataTables.Buttons`
// since this file can be loaded before Button's core!
DataTable.fileSave = _saveAs;


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Local (private) functions
 */

/**
 * Get the sheet name for Excel exports.
 *
 * @param {object}	config Button configuration
 */
var _sheetname = function ( config )
{
	var sheetName = 'Sheet1';

	if ( config.sheetName ) {
		sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
	}

	return sheetName;
};

/**
 * Get the newline character(s)
 *
 * @param {object}	config Button configuration
 * @return {string}				Newline character
 */
var _newLine = function ( config )
{
	return config.newline ?
		config.newline :
		navigator.userAgent.match(/Windows/) ?
			'\r\n' :
			'\n';
};

/**
 * Combine the data from the `buttons.exportData` method into a string that
 * will be used in the export file.
 *
 * @param	{DataTable.Api} dt		 DataTables API instance
 * @param	{object}				config Button configuration
 * @return {object}							 The data to export
 */
var _exportData = function ( dt, config )
{
	var newLine = _newLine( config );
	var data = dt.buttons.exportData( config.exportOptions );
	var boundary = config.fieldBoundary;
	var separator = config.fieldSeparator;
	var reBoundary = new RegExp( boundary, 'g' );
	var escapeChar = config.escapeChar !== undefined ?
		config.escapeChar :
		'\\';
	var join = function ( a ) {
		var s = '';

		// If there is a field boundary, then we might need to escape it in
		// the source data
		for ( var i=0, ien=a.length ; i<ien ; i++ ) {
			if ( i > 0 ) {
				s += separator;
			}

			s += boundary ?
				boundary + ('' + a[i]).replace( reBoundary, escapeChar+boundary ) + boundary :
				a[i];
		}

		return s;
	};

	var header = config.header ? join( data.header )+newLine : '';
	var footer = config.footer && data.footer ? newLine+join( data.footer ) : '';
	var body = [];

	for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
		body.push( join( data.body[i] ) );
	}

	return {
		str: header + body.join( newLine ) + footer,
		rows: body.length
	};
};

/**
 * Older versions of Safari (prior to tech preview 18) don't support the
 * download option required.
 *
 * @return {Boolean} `true` if old Safari
 */
var _isDuffSafari = function ()
{
	var safari = navigator.userAgent.indexOf('Safari') !== -1 &&
		navigator.userAgent.indexOf('Chrome') === -1 &&
		navigator.userAgent.indexOf('Opera') === -1;

	if ( ! safari ) {
		return false;
	}

	var version = navigator.userAgent.match( /AppleWebKit\/(\d+\.\d+)/ );
	if ( version && version.length > 1 && version[1]*1 < 603.1 ) {
		return true;
	}

	return false;
};

/**
 * Convert from numeric position to letter for column names in Excel
 * @param  {int} n Column number
 * @return {string} Column letter(s) name
 */
function createCellPos( n ){
	var ordA = 'A'.charCodeAt(0);
	var ordZ = 'Z'.charCodeAt(0);
	var len = ordZ - ordA + 1;
	var s = "";

	while( n >= 0 ) {
		s = String.fromCharCode(n % len + ordA) + s;
		n = Math.floor(n / len) - 1;
	}

	return s;
}

try {
	var _serialiser = new XMLSerializer();
	var _ieExcel;
}
catch (t) {}

/**
 * Recursively add XML files from an object's structure to a ZIP file. This
 * allows the XSLX file to be easily defined with an object's structure matching
 * the files structure.
 *
 * @param {JSZip} zip ZIP package
 * @param {object} obj Object to add (recursive)
 */
function _addToZip( zip, obj ) {
	if ( _ieExcel === undefined ) {
		// Detect if we are dealing with IE's _awful_ serialiser by seeing if it
		// drop attributes
		_ieExcel = _serialiser
			.serializeToString(
				( new window.DOMParser() ).parseFromString( excelStrings['xl/worksheets/sheet1.xml'], 'text/xml' )
			)
			.indexOf( 'xmlns:r' ) === -1;
	}

	$.each( obj, function ( name, val ) {
		if ( $.isPlainObject( val ) ) {
			var newDir = zip.folder( name );
			_addToZip( newDir, val );
		}
		else {
			if ( _ieExcel ) {
				// IE's XML serialiser will drop some name space attributes from
				// from the root node, so we need to save them. Do this by
				// replacing the namespace nodes with a regular attribute that
				// we convert back when serialised. Edge does not have this
				// issue
				var worksheet = val.childNodes[0];
				var i, ien;
				var attrs = [];

				for ( i=worksheet.attributes.length-1 ; i>=0 ; i-- ) {
					var attrName = worksheet.attributes[i].nodeName;
					var attrValue = worksheet.attributes[i].nodeValue;

					if ( attrName.indexOf( ':' ) !== -1 ) {
						attrs.push( { name: attrName, value: attrValue } );

						worksheet.removeAttribute( attrName );
					}
				}

				for ( i=0, ien=attrs.length ; i<ien ; i++ ) {
					var attr = val.createAttribute( attrs[i].name.replace( ':', '_dt_b_namespace_token_' ) );
					attr.value = attrs[i].value;
					worksheet.setAttributeNode( attr );
				}
			}

			var str = _serialiser.serializeToString(val);

			// Fix IE's XML
			if ( _ieExcel ) {
				// IE doesn't include the XML declaration
				if ( str.indexOf( '<?xml' ) === -1 ) {
					str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+str;
				}

				// Return namespace attributes to being as such
				str = str.replace( /_dt_b_namespace_token_/g, ':' );

				// Remove testing name space that IE puts into the space preserve attr
				str = str.replace( /xmlns:NS[\d]+="" NS[\d]+:/g, '' );
			}

			// Safari, IE and Edge will put empty name space attributes onto
			// various elements making them useless. This strips them out
			str = str.replace( /<([^<>]*?) xmlns=""([^<>]*?)>/g, '<$1 $2>' );

			zip.file( name, str );
		}
	} );
}

/**
 * Create an XML node and add any children, attributes, etc without needing to
 * be verbose in the DOM.
 *
 * @param  {object} doc      XML document
 * @param  {string} nodeName Node name
 * @param  {object} opts     Options - can be `attr` (attributes), `children`
 *   (child nodes) and `text` (text content)
 * @return {node}            Created node
 */
function _createNode( doc, nodeName, opts ) {
	var tempNode = doc.createElement( nodeName );

	if ( opts ) {
		if ( opts.attr ) {
			$(tempNode).attr( opts.attr );
		}

		if ( opts.children ) {
			$.each( opts.children, function ( key, value ) {
				tempNode.appendChild( value );
			} );
		}

		if ( opts.text !== null && opts.text !== undefined ) {
			tempNode.appendChild( doc.createTextNode( opts.text ) );
		}
	}

	return tempNode;
}

/**
 * Get the width for an Excel column based on the contents of that column
 * @param  {object} data Data for export
 * @param  {int}    col  Column index
 * @return {int}         Column width
 */
function _excelColWidth( data, col ) {
	var max = data.header[col].length;
	var len, lineSplit, str;

	if ( data.footer && data.footer[col].length > max ) {
		max = data.footer[col].length;
	}

	for ( var i=0, ien=data.body.length ; i<ien ; i++ ) {
		var point = data.body[i][col];
		str = point !== null && point !== undefined ?
			point.toString() :
			'';

		// If there is a newline character, workout the width of the column
		// based on the longest line in the string
		if ( str.indexOf('\n') !== -1 ) {
			lineSplit = str.split('\n');
			lineSplit.sort( function (a, b) {
				return b.length - a.length;
			} );

			len = lineSplit[0].length;
		}
		else {
			len = str.length;
		}

		if ( len > max ) {
			max = len;
		}

		// Max width rather than having potentially massive column widths
		if ( max > 40 ) {
			return 54; // 40 * 1.35
		}
	}

	max *= 1.35;

	// And a min width
	return max > 6 ? max : 6;
}

// Excel - Pre-defined strings to build a basic XLSX file
var excelStrings = {
	"_rels/.rels":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
			'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'+
		'</Relationships>',

	"xl/_rels/workbook.xml.rels":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
			'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'+
			'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'+
		'</Relationships>',

	"[Content_Types].xml":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
			'<Default Extension="xml" ContentType="application/xml" />'+
			'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />'+
			'<Default Extension="jpeg" ContentType="image/jpeg" />'+
			'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />'+
			'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />'+
			'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />'+
		'</Types>',

	"xl/workbook.xml":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
			'<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>'+
			'<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>'+
			'<bookViews>'+
				'<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>'+
			'</bookViews>'+
			'<sheets>'+
				'<sheet name="Sheet1" sheetId="1" r:id="rId1"/>'+
			'</sheets>'+
			'<definedNames/>'+
		'</workbook>',

	"xl/worksheets/sheet1.xml":
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
		'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+
			'<sheetData/>'+
			'<mergeCells count="0"/>'+
		'</worksheet>',

	"xl/styles.xml":
		'<?xml version="1.0" encoding="UTF-8"?>'+
		'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+
			'<numFmts count="6">'+
				'<numFmt numFmtId="164" formatCode="#,##0.00_-\ [$$-45C]"/>'+
				'<numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/>'+
				'<numFmt numFmtId="166" formatCode="[$€-2]\ #,##0.00"/>'+
				'<numFmt numFmtId="167" formatCode="0.0%"/>'+
				'<numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/>'+
				'<numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/>'+
			'</numFmts>'+
			'<fonts count="5" x14ac:knownFonts="1">'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
				'</font>'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
					'<color rgb="FFFFFFFF" />'+
				'</font>'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
					'<b />'+
				'</font>'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
					'<i />'+
				'</font>'+
				'<font>'+
					'<sz val="11" />'+
					'<name val="Calibri" />'+
					'<u />'+
				'</font>'+
			'</fonts>'+
			'<fills count="6">'+
				'<fill>'+
					'<patternFill patternType="none" />'+
				'</fill>'+
				'<fill>'+ // Excel appears to use this as a dotted background regardless of values but
					'<patternFill patternType="none" />'+ // to be valid to the schema, use a patternFill
				'</fill>'+
				'<fill>'+
					'<patternFill patternType="solid">'+
						'<fgColor rgb="FFD9D9D9" />'+
						'<bgColor indexed="64" />'+
					'</patternFill>'+
				'</fill>'+
				'<fill>'+
					'<patternFill patternType="solid">'+
						'<fgColor rgb="FFD99795" />'+
						'<bgColor indexed="64" />'+
					'</patternFill>'+
				'</fill>'+
				'<fill>'+
					'<patternFill patternType="solid">'+
						'<fgColor rgb="ffc6efce" />'+
						'<bgColor indexed="64" />'+
					'</patternFill>'+
				'</fill>'+
				'<fill>'+
					'<patternFill patternType="solid">'+
						'<fgColor rgb="ffc6cfef" />'+
						'<bgColor indexed="64" />'+
					'</patternFill>'+
				'</fill>'+
			'</fills>'+
			'<borders count="2">'+
				'<border>'+
					'<left />'+
					'<right />'+
					'<top />'+
					'<bottom />'+
					'<diagonal />'+
				'</border>'+
				'<border diagonalUp="false" diagonalDown="false">'+
					'<left style="thin">'+
						'<color auto="1" />'+
					'</left>'+
					'<right style="thin">'+
						'<color auto="1" />'+
					'</right>'+
					'<top style="thin">'+
						'<color auto="1" />'+
					'</top>'+
					'<bottom style="thin">'+
						'<color auto="1" />'+
					'</bottom>'+
					'<diagonal />'+
				'</border>'+
			'</borders>'+
			'<cellStyleXfs count="1">'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />'+
			'</cellStyleXfs>'+
			'<cellXfs count="68">'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment horizontal="left"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment horizontal="center"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment horizontal="right"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment horizontal="fill"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment textRotation="90"/>'+
				'</xf>'+
				'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
					'<alignment wrapText="1"/>'+
				'</xf>'+
				'<xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
				'<xf numFmtId="14" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>'+
			'</cellXfs>'+
			'<cellStyles count="1">'+
				'<cellStyle name="Normal" xfId="0" builtinId="0" />'+
			'</cellStyles>'+
			'<dxfs count="0" />'+
			'<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" />'+
		'</styleSheet>'
};
// Note we could use 3 `for` loops for the styles, but when gzipped there is
// virtually no difference in size, since the above can be easily compressed

// Pattern matching for special number formats. Perhaps this should be exposed
// via an API in future?
// Ref: section 3.8.30 - built in formatters in open spreadsheet
//   https://www.ecma-international.org/news/TC45_current_work/Office%20Open%20XML%20Part%204%20-%20Markup%20Language%20Reference.pdf
var _excelSpecials = [
	{ match: /^\-?\d+\.\d%$/,               style: 60, fmt: function (d) { return d/100; } }, // Precent with d.p.
	{ match: /^\-?\d+\.?\d*%$/,             style: 56, fmt: function (d) { return d/100; } }, // Percent
	{ match: /^\-?\$[\d,]+.?\d*$/,          style: 57 }, // Dollars
	{ match: /^\-?£[\d,]+.?\d*$/,           style: 58 }, // Pounds
	{ match: /^\-?€[\d,]+.?\d*$/,           style: 59 }, // Euros
	{ match: /^\-?\d+$/,                    style: 65 }, // Numbers without thousand separators
	{ match: /^\-?\d+\.\d{2}$/,             style: 66 }, // Numbers 2 d.p. without thousands separators
	{ match: /^\([\d,]+\)$/,                style: 61, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets
	{ match: /^\([\d,]+\.\d{2}\)$/,         style: 62, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets - 2d.p.
	{ match: /^\-?[\d,]+$/,                 style: 63 }, // Numbers with thousand separators
	{ match: /^\-?[\d,]+\.\d{2}$/,          style: 64 },
	{ match: /^[\d]{4}\-[\d]{2}\-[\d]{2}$/, style: 67, fmt: function (d) {return Math.round(25569 + (Date.parse(d) / (86400 * 1000)));}} //Date yyyy-mm-dd
];



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Buttons
 */

//
// Copy to clipboard
//
DataTable.ext.buttons.copyHtml5 = {
	className: 'buttons-copy buttons-html5',

	text: function ( dt ) {
		return dt.i18n( 'buttons.copy', 'Copy' );
	},

	action: function ( e, dt, button, config ) {
		this.processing( true );

		var that = this;
		var exportData = _exportData( dt, config );
		var info = dt.buttons.exportInfo( config );
		var newline = _newLine(config);
		var output = exportData.str;
		var hiddenDiv = $('<div/>')
			.css( {
				height: 1,
				width: 1,
				overflow: 'hidden',
				position: 'fixed',
				top: 0,
				left: 0
			} );

		if ( info.title ) {
			output = info.title + newline + newline + output;
		}

		if ( info.messageTop ) {
			output = info.messageTop + newline + newline + output;
		}

		if ( info.messageBottom ) {
			output = output + newline + newline + info.messageBottom;
		}

		if ( config.customize ) {
			output = config.customize( output, config, dt );
		}

		var textarea = $('<textarea readonly/>')
			.val( output )
			.appendTo( hiddenDiv );

		// For browsers that support the copy execCommand, try to use it
		if ( document.queryCommandSupported('copy') ) {
			hiddenDiv.appendTo( dt.table().container() );
			textarea[0].focus();
			textarea[0].select();

			try {
				var successful = document.execCommand( 'copy' );
				hiddenDiv.remove();

				if (successful) {
					dt.buttons.info(
						dt.i18n( 'buttons.copyTitle', 'Copy to clipboard' ),
						dt.i18n( 'buttons.copySuccess', {
							1: 'Copied one row to clipboard',
							_: 'Copied %d rows to clipboard'
						}, exportData.rows ),
						2000
					);

					this.processing( false );
					return;
				}
			}
			catch (t) {}
		}

		// Otherwise we show the text box and instruct the user to use it
		var message = $('<span>'+dt.i18n( 'buttons.copyKeys',
				'Press <i>ctrl</i> or <i>\u2318</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>'+
				'To cancel, click this message or press escape.' )+'</span>'
			)
			.append( hiddenDiv );


		// Select the text so when the user activates their system clipboard

		};
