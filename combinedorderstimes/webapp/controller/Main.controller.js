sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"../model/ODataModel",
	"../resources/thirdparty/moment/moment.min",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
], function (BaseController, formatter, ODataModel, Moment, BusyIndicator, MessageBox, Filter, FilterOperator, JSONModel) {
	"use strict";

	return BaseController.extend("com.plato.combinedorderstimes.controller.Main", {
		moment: Moment,
		oUIModel: null,
		formatter: formatter,
		oOdataModel: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.oUIModel = this.getOwnerComponent().getUIModel();
			this.setModel(this.getOwnerComponent().getModel("ui"), "view");
			this.oOdataModel = new ODataModel(this);
			this.oReasonModel = new ODataModel(this, "reasons");
			this.oWCModel = new ODataModel(this, "workCenter");
			this.oUnitModel = new ODataModel(this, "UoM");
			this.oOperationModel = new ODataModel(this, "lastOperation");
			this.oConfirmationModel = new ODataModel(this, "orderConfirmation");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack: function () {
			history.go(-1);
		},

		onMessagePopoverPress : function (oEvent) {
            this._getMessagePopover().openBy(oEvent.getSource());
		},

		onChangeDate : function (oEvent) {
			this._oDTPicker = oEvent.getSource();
			this._validateFieldsView();

			if (moment(oEvent.getSource().getDateValue()).isAfter() || !oEvent.getParameter("valid") || oEvent.getParameter("value") === "") {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);

				if (this._oDTPicker.getName().includes("Finish")) {
					this.oUIModel.setFinishDate(false);
				} else {
					this.oUIModel.setStartDate(false);
				}

				return;
			}

			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);

			if (this._oDTPicker.getName().includes("Finish")) {
				this.oUIModel.setFinishDate(true);

				if (this.oUIModel.getSetupPage()) {
					this._setSetup(oEvent.getSource().getDateValue());
				} else {
					this._setLabor(oEvent.getSource().getDateValue());
				}
			} else {
				this.oUIModel.setStartDate(true);
			}
		},
		
		onCreate: function(oEvent) {
			var that = this, oPromise;
			BusyIndicator.show();
			var mData = this.getModel("newObject").getData();
			
			if (this._oDTPicker === undefined) {
				var sFieldName = this.oUIModel.getFinishView() ? "DTPFinish" : "DTPStart";
				var oFormContainer = this._getFormContainer(oEvent.getSource().getParent().getParent());
				this._oDTPicker = this._getFormField(oFormContainer, sFieldName);
			}

			var mDraftModel = this.oUIModel.getDraftModel(mData, this._oDTPicker);

			if (this.oTable === undefined) {
				oPromise = this.oOdataModel.create("/ConfirmationSet", mDraftModel);

				oPromise
					.then( function(oData) {
						that._clearInputFields();
						MessageBox.success(that.getResourceBundle().getText("confirmationCreated", [oData.ConfirmationGroup, oData.OrderConfirmation]));
					})
					.catch( function(error) {
						MessageBox.error(JSON.parse(error.responseText.normalize()).error.message.value);
					})
					.finally( function() {
						BusyIndicator.hide();
					});
			} else {
				if (this.oTable.getModel("orderItems") === undefined) {
					oPromise = this.oOdataModel.create("/ConfirmationSet", mDraftModel);

					oPromise
						.then( function(oData) {
							that._clearInputFields();
							MessageBox.success(that.getResourceBundle().getText("confirmationCreated", [oData.ConfirmationGroup, oData.OrderConfirmation]));
						})
						.catch( function(error) {
							MessageBox.error(JSON.parse(error.responseText.normalize()).error.message.value);
						})
						.finally( function() {
							BusyIndicator.hide();
						});
				} else {
					this._setupTimeticket(true, mDraftModel);
				}
			}
		},

		handleOrderSuggestion : function (oEvent) {
			var sText = oEvent.getParameter("suggestValue");
			var aFilters = [];

			if (sText) {
				// aFilters.push(new Filter("ConcatID", FilterOperator.Contains, sText));
				aFilters.push(new Filter("ConfirmationGroup", FilterOperator.Contains, sText));
				aFilters.push(new Filter("OrderID", FilterOperator.Contains, sText));

				var oFilter = new Filter({
					filters: aFilters
				});
			}

			oEvent.getSource().getBinding("suggestionRows").filter(oFilter);
		},

		handlePernrSuggestion : function (oEvent) {
			var sText = oEvent.getParameter("suggestValue");
			var aFilters = [];

			if (sText) {
				aFilters.push(new Filter("Employee", FilterOperator.Contains, sText));
				aFilters.push(new Filter("EmployeeFullName", FilterOperator.Contains, sText));

				var oFilter = new Filter({
					filters: aFilters
				});
			}

			oEvent.getSource().getBinding("suggestionRows").filter(oFilter);
		},

		onLiveChange : function (oEvent) {
			if (oEvent.getParameter("value") === "") {
				this._clearInputFields();
			}
		},

		onTableLiveChange : function (oEvent) {
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var mChanged = oEvent.getSource().getParent().getBindingContext("orderItems").getObject(sPath);
			var aData = oEvent.getSource().getParent().getBindingContext("orderItems").getModel().getData();
			var fYield = parseFloat(0);

			for (var i = 0; i < aData.length; i++) {
				if (aData[i].Aufnr === mChanged.Aufnr && aData[i].Posnr === mChanged.Posnr) {
					fYield = fYield + parseFloat(oEvent.getParameter("value"));
				} else {
					fYield = fYield + parseFloat(aData[i].Yield);
				}
			}

			this.getModel("newObject").setProperty("/ConfirmationYieldQuantity", fYield);
		},

		onSelectedOrder : function (oEvent) {
			var sPath = oEvent.getParameter("selectedRow").getBindingContextPath("orderConfirmation");
			var mData = oEvent.getParameter("selectedRow").getBindingContext("orderConfirmation").getObject(sPath);
			this.getModel("newObject").setData(mData);
			this._reasonInputField = this._getFormField(oEvent.getSource().getParent().getParent(), "reason");
			var sFieldName = this.oUIModel.getFinishView() ? "DTPFinish" : "DTPStart";
			this._oDTPicker = this._getFormField(oEvent.getSource().getParent().getParent(), sFieldName);
			this.oUIModel.setConfirmation(true);
			this.oUIModel.setEditMode(true);			
			this._validateFieldsView(oEvent);

			//Check if it's a Combined Order
			if (mData.requestID === "Z") {
				if (this.oUIModel.getFinishView() && !this.oUIModel.getSetupPage()) {
					this.oOdataModel.getOperationsByOrderID(mData.OrderInternalID, mData.OrderOperationInternalID, mData.OrderID, this.oTable, this.oUIModel);
				}
				
			} else {
				this.oUIModel.setLastOperation(false);
				this.oUIModel.setYield(this.oUIModel.getEditMode());
			}

			if (this.oUIModel.getFinishView()) {
				this._getReasons(this.getModel("newObject").getProperty("/Plant"));
			}
		},

		onValueHelpRequested: function(oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("com.plato.combinedorderstimes.view.workCenterVHDialog", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this._createColumnHeading(this.getModel("workcenterTemplate").getData());
			this._bindValueHelpTable(this.getModel("workcenterTemplate"), "workCenter", "/Z_C_WORKCENTER");
			this._oInput = oEvent.getSource();
			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");

			for (var i = 0; i < aTokens[0].getAggregation("customData").length; i++) {
				if (aTokens[0].getAggregation("customData")[i].getValue().Plant !== undefined) {
					var sPlant = aTokens[0].getAggregation("customData")[i].getValue().Plant;
					break;
				}
			}

			this.getModel("newObject").setProperty("/WorkCenter", aTokens[0].getKey());
			this.getModel("newObject").setProperty("/Plant", sPlant);
			this._getReasons(sPlant);
			this._oInput.setSelectedKey(aTokens[0].getKey());
			this._oInput.setValue(aTokens[0].getKey() + " / " + sPlant);
			this._oValueHelpDialog.close();
		},

		onUnitValueHelpRequested: function(oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("com.plato.combinedorderstimes.view.unitVHDialog", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this._createColumnHeading(this.getModel("unitTemplate").getData());
			this._bindValueHelpTable(this.getModel("unitTemplate"), "UoM", "/Z_C_UNITS");
			this._oInputUoM = oEvent.getSource();
			this._oValueHelpDialog.open();
		},

		onUnitValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this.getModel("newObject").setProperty("/OperationUnit", aTokens[0].getKey());
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},

		onDetailPagesNav : function (oEvent) {
			var oToPage = oEvent.getParameter("to");
			this.oUIModel.setYield(this.oUIModel.getEditMode());
			var oFormContainer = this._getFormContainer(oToPage);
			this._reasonInputField = this._getFormField(oFormContainer, "reason");
			this.oFinishProcessingPage = oToPage;
			this._validateFieldsView("", oToPage);			
		},

		onChangeReason : function (oEvent) {
			this.getModel("newObject").setProperty("/ReasonCode", oEvent.getParameter("selectedItem").getKey()); 
		},

		onChangeEmployeeNumber: function (oEvent) {
			if (this._oDTPicker !== undefined) {
				if (this.oUIModel.getSetupPage()) {
					this._setSetup(this._oDTPicker.getDateValue());
				} else {
					this._setLabor(this._oDTPicker.getDateValue());
				}
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		onListItemPress : function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
			this.byId("SimpleFormSplitscreen").toDetail(this.createId(sToPageId));
		},

		_createColumnHeading: function(oData) {
			var oHeaders = oData.cols;
			
			for (var i = 0; i < oHeaders.length; i++) {
				oHeaders[i].label = this.getModel("i18n").getResourceBundle().getText(oHeaders[i].key);
			}
			
			return oHeaders;
		},

		_bindValueHelpTable : function (oModel, sODataModel, sEntitySet) {
			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.getModel(sODataModel));
				oTable.setModel(oModel, "columns");
				
				if (oTable.bindRows) {
					oTable.bindAggregation("rows", sEntitySet);
				}

				this._oValueHelpDialog.update();
			}.bind(this));
		},

		_getFormField : function (oSource, sFieldName) {
			var aElements = oSource.getAggregation("formElements");
			for (var i = 0; i < aElements.length; i++) {
				if (aElements[i].getAggregation("fields")[0].getName() === sFieldName) {
					return aElements[i].getAggregation("fields")[0];
				}
			}
		},

		_getReasons : function (sWorkCenter) {
			if (sWorkCenter !== undefined) {
				var that = this;
				var aFilters = [];
				aFilters.push(new Filter("Plant", FilterOperator.EQ, sWorkCenter));

				var oFilter = new Filter({
					filters: aFilters
				});

				this.oReasonModel.getEntitySet("/Z_C_REASONS", oFilter)
					.then( function(oData) {
						var oJSONModel = new JSONModel();
						var aData = oData.results;                     
						oJSONModel.setData(aData);
						that._reasonInputField.setModel(oJSONModel, "reasons");
						
						that._reasonInputField.bindItems({
							path: "reasons>/",
							template : that._reasonInputField.getBindingInfo("items").template
						});

						if (that.getModel("newObject").getData().ReasonCode !== "") {
							that._reasonInputField.setSelectedKey(that.getModel("newObject").getData().ReasonCode);
						}
					})
					.catch( function(error) {
						// MessageBox.error(error);
					});
			}			
		},

		_clearInputFields: function () {
			this.getModel("newObject").setData();
			this.oUIModel.setConfirmation(false);
			this.oUIModel.setEditMode(false);
			this.oUIModel.setYield(false);

			if (this.oTable !== undefined) {
				if (this.oTable.getModel("orderItems") !== undefined) {
					this.oTable.getModel("orderItems").setData();
				}
			}
		},

		_validateFieldsView: function (oEvent, oParameter) {
			var sName;

			if (oParameter === undefined) {
				if (this._oDTPicker === undefined) {
					var oField = this._getFormField(oEvent.getSource().getParent().getParent(), "DTPStart");

					if (oField === undefined) {
						oField = this._getFormField(oEvent.getSource().getParent().getParent(), "DTPFinish");
					}
					
					sName = oField.getName();
				} else {
					sName = this._oDTPicker.getName();
				}				
			} else {
				sName = oParameter.getProperty("fieldGroupIds")[0];	

				if (sName.includes("Setup")) {
					this.oUIModel.setSetupPage(true);
				} else {
					this.oUIModel.setSetupPage(false);
				}				
			}
			
			if (sName.includes("Finish")) {
				this.oUIModel.setFinishView(true);

				if (this.oUIModel.getSetupPage()) {
					this.getModel("newObject").getProperty("/ConfirmedSetupEndDate") === null ? this.oUIModel.setFinishDate(false) : this.oUIModel.setFinishDate(true);
				} else {
					this._getFormContainer(this.oFinishProcessingPage);
					this.getModel("newObject").getProperty("/ConfirmedProcessingEndDate") === null ? this.oUIModel.setFinishDate(false) : this.oUIModel.setFinishDate(true);
				}
			} else {
				this.oUIModel.setFinishView(false);
				
				if (this.oUIModel.getSetupPage()) {
					this.getModel("newObject").getProperty("/ExecutionStartDate") === null ? this.oUIModel.setStartDate(false) : this.oUIModel.setStartDate(true);
				} else {
					this.getModel("newObject").getProperty("/ConfirmedProcessingStartDate") === null ? this.oUIModel.setStartDate(false) : this.oUIModel.setStartDate(true);
				}
			}

			if (this._reasonInputField === undefined) {
				if (this.oUIModel.getFinishView() && oParameter !== undefined) {
					var oSource = oParameter.getContent()[0].getItems()[0].getAggregation("form").getFormContainers()[0];
					this._reasonInputField = this._getFormField(oSource, "reason");
					this._getReasons(this.getModel("newObject").getProperty("/Plant"));
				}
			} else if (this._reasonInputField.getModel("reasons").getData() === null && this.oUIModel.getFinishView()) {
				this._getReasons(this.getModel("newObject").getProperty("/Plant"));
			}
		},

		_setupTimeticket: function (bQuantity, mDataModel) {
			var aPromises = [], oPromise;	
			var aData = this.oTable.getModel("orderItems").getData();
			var that = this;

			for (var i = 0; i < aData.length; i++) {
				var mData = {};
				mData.Aufnr      = aData[i].OriginalOrder;
				mData.Counter    = this.getModel("newObject").getProperty("/OrderOperationInternalID");
				mData.Order      = this.getModel("newObject").getProperty("/OrderInternalID");
				mData.Quantity   = aData[i].Yield;
				mData.Unit     	 = aData[i].ConfirmedUnit;
				mData.FlagSetQty = bQuantity;
				oPromise = this.oOdataModel.create("/OrderCombinationSet", mData);
				aPromises.push(oPromise);
			}

			if (bQuantity) {
				oPromise = this.oOdataModel.create("/ConfirmationSet", mDataModel);
				aPromises.push(oPromise);
			}
			
			Promise.all(aPromises)
				.then( function(oData) {
					if (bQuantity) {
						that._setupTimeticket(false);

						oData.forEach( function (sValue, i) {
							if (sValue.OrderConfirmation !== undefined) {
								that.mResponse = sValue;
							}
						});
					} else {
						that._clearInputFields();
						MessageBox.success(that.getResourceBundle().getText("confirmationCreated", [that.mResponse.ConfirmationGroup, that.mResponse.OrderConfirmation]));
					}	
				})
				.catch( function(error) {
					if (JSON.parse(error.responseText.normalize()).error.innererror.errordetails[0] !== undefined) {
						MessageBox.error(JSON.parse(error.responseText.normalize()).error.innererror.errordetails[0].message);
					} else {
						MessageBox.error(JSON.parse(error.responseText.normalize()).error.message.value);
					}
					
					BusyIndicator.hide();
				})
				.finally( function() {
					if (!bQuantity) {
						BusyIndicator.hide();
					}
				});
		},

		_getFormContainer : function (oPage) {
			if (oPage.getAggregation("content")[0].getAggregation("items") === null) {
				if (oPage.getAggregation("content")[0].getAggregation("sections") !== null) {
					var aSections = oPage.getAggregation("content")[0].getAggregation("sections");

					for (var i = 0; i < aSections.length; i++) {
						var mBlock = oPage.getAggregation("content")[0].getAggregation("sections")[i].getAggregation("subSections")[0].getAggregation("blocks")[0];

						if (aSections[i].getFieldGroupIds()[0] === "table") {
							var oTable = mBlock;

							if (this.oTable === undefined) {
								if (this.oOdataModel.getJSONModel() !== null) {
									oTable.setModel(this.oOdataModel.getJSONModel(), "orderItems");
					
									oTable.bindItems({
										path: "orderItems>/",
										template : oTable.getBindingInfo("items").template
									});										
								}

								this.oTable = oTable;
							}	

							if (this.oUIModel.getLastOperation()) {
								this.oUIModel.setYield(false);
							}
						}

						if (aSections[i].getFieldGroupIds()[0] === "form") {
							var oForm = mBlock.getAggregation("form").getAggregation("formContainers")[0];
						}
					}

					return oForm;
				}
			} else {
				return oPage.getAggregation("content")[0].getAggregation("items")[0].getAggregation("form").getAggregation("formContainers")[0];
			}
		},

		_setSetup: function (dTo) {
			var mData = this.getModel("newObject").getData();

			if (mData.ExecutionStartDate !== null) {
				var dFrom = moment(mData.ExecutionStartDate).hours(moment.duration(mData.ExecutionStartTime).hours());
				dFrom = moment(dFrom).minutes(moment.duration(mData.ExecutionStartTime).minutes());
				dFrom = moment(dFrom).seconds(moment.duration(mData.ExecutionStartTime).seconds());
				var oSetup = moment.duration(moment(dTo).diff(dFrom));
				var fSetup = oSetup.hours() >= 1 ? oSetup.asHours() : oSetup.asMinutes();

				if (mData.NumberOfEmployees > 0) {
					fSetup = fSetup * mData.NumberOfEmployees;
				}

				this.getModel("newObject").setProperty("/Setup", fSetup);
				this.getModel("newObject").setProperty("/UnitSetup", oSetup.hours() >= 1 ? "H" : "MIN");
			}
		},

		_setLabor: function (dTo) {
			var mData = this.getModel("newObject").getData();

			if (mData.ConfirmedProcessingStartDate !== null) {
				var dFrom = moment(mData.ConfirmedProcessingStartDate).hours(moment.duration(mData.ConfirmedProcessingStartTime).hours());
				dFrom = moment(dFrom).minutes(moment.duration(mData.ConfirmedProcessingStartTime).minutes());
				dFrom = moment(dFrom).seconds(moment.duration(mData.ConfirmedProcessingStartTime).seconds());
				var oLabor = moment.duration(moment(dTo).diff(moment(dFrom)));
				var fLabor = oLabor.hours() >= 1 ? oLabor.asHours() : oLabor.asMinutes();

				this.getModel("newObject").setProperty("/Machine", fLabor);
				this.getModel("newObject").setProperty("/UnitMachine", oLabor.hours() >= 1 ? "H" : "MIN");

				if (mData.NumberOfEmployees > 0) {
					fLabor = fLabor * mData.NumberOfEmployees;
				}

				this.getModel("newObject").setProperty("/Labor", fLabor);
				this.getModel("newObject").setProperty("/UnitLabor", oLabor.hours() >= 1 ? "H" : "MIN");
			}
		}
	});
});
