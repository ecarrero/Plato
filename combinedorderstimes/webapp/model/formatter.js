sap.ui.define([
	"sap/ui/core/format/DateFormat"
], function (DateFormat) {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		parseDate: function (sValue) {
			var dFormat = DateFormat.getDateInstance({
				style: "medium"
			});

			return dFormat.format(sValue);
		},

		setState: function (fConfirmed, fTotal) {
			fConfirmed = parseFloat(fConfirmed);
			fTotal = parseFloat(fTotal);

			if (fConfirmed === 0) {
				return "None";
			} else if (fConfirmed <= fTotal) {
				return "Success";
			} else {
				return "Error";
			}
		},

		setDateTime : function (dValue, tValue) {
			if (dValue === undefined ||  dValue === null || tValue === undefined || tValue === null) {
				return;
			}

			var dTime = dValue.getTime();

			var dFormat = DateFormat.getDateTimeInstance({
				pattern: "YYYY-MM-ddTHH:mm:ss",
				strictParsing: true,
				UTC: false,
				style: "short"
			});

			var sTimeOffset = new Date(0).getTimezoneOffset() * 60 * 1000;
			return dFormat.format(new Date(dTime + tValue.ms + sTimeOffset));
		}
	};

});