sap.ui.define(["sap/ui/base/Object", "sap/ui/model/json/JSONModel", "sap/ui/core/format/DateFormat"], function (BaseObject, JSONModel, DateFormat) {

  return BaseObject.extend("com.plato.combinedorderstimes.model.UIModel", {
    oComponentCtrl: null,
    oModel: null,

    constructor: function (oComponentCtrl) {
      this.oComponentCtrl = oComponentCtrl;
    },

    generate: function () {
      this.oModel = new JSONModel({
        editMode : false,
        enableConfirmation: false,
        enableStartDate: false,
        enableFinishDate: false,
        finishView: false,
        setupPage: true,
        lastOperation: false,
        enableYield: false
      });

      return this.oModel;
    },

    insertionModel: function () {
      return new JSONModel();
    },

    getDraftModel: function (mData, oDTPicker) {
      var dEnteredDate, tEnteredTime;

      if (oDTPicker !== undefined) {
        tEnteredTime = this.formatTime(oDTPicker.getDateValue());
        dEnteredDate = oDTPicker.getDateValue();
      }

      if (this.getFinishView()) {
        var mDraftModel = {
          ConfirmationGroup: mData.ConfirmationGroup,
          OrderID: mData.OrderID,
          Sequence: mData.Sequence,
          Operation: mData.Operation,
          IsFinalConfirmation: mData.IsFinalConfirmation,
          ReasonCode: mData.ReasonCode,
          Plant: mData.Plant,
          WorkCenter: mData.WorkCenter,
          OperationUnit: mData.OperationUnit,
          ConfirmationYieldQuantity: mData.ConfirmationYieldQuantity,
          ConfirmationScrapQuantity: mData.ConfirmationScrapQuantity,
          ConfirmationReworkQuantity: mData.ConfirmationReworkQuantity,
          NumberOfEmployees: mData.NumberOfEmployees
        }

        if (this.getSetupPage()) {
          mDraftModel.ConfirmedSetupEndDate = dEnteredDate;
          mDraftModel.ConfirmedSetupEndTime = tEnteredTime;
          mDraftModel.Setup = (mData.Setup).toString();
          mDraftModel.UnitSetup = mData.UnitSetup;
        } else {
          mDraftModel.ConfirmationYieldQuantity  = parseFloat(mData.ConfirmationYieldQuantity).toFixed(3),
          mDraftModel.ConfirmedProcessingEndDate = dEnteredDate;
          mDraftModel.ConfirmedProcessingEndTime = tEnteredTime;
          mDraftModel.Labor = (mData.Labor).toString();
          mDraftModel.UnitLabor = mData.UnitLabor;
          mDraftModel.Machine = (mData.Machine).toString();
          mDraftModel.UnitMachine = mData.UnitMachine;
        }
      } else {
        var mDraftModel = {
          ConfirmationGroup: mData.ConfirmationGroup,
          OrderID: mData.OrderID,
          Sequence: mData.Sequence,
          Operation: mData.Operation,
          IsFinalConfirmation: false,
          Plant: mData.Plant,
          Personnel: mData.Personnel,          
          WorkCenter: mData.WorkCenter,
          NumberOfEmployees: mData.NumberOfEmployees
        }

        if (this.getSetupPage()) {
          mDraftModel.ExecutionStartDate = dEnteredDate;
          mDraftModel.ExecutionStartTime = tEnteredTime;
        } else {
          mDraftModel.ConfirmedProcessingStartDate = dEnteredDate;
          mDraftModel.ConfirmedProcessingStartTime = tEnteredTime;
        }
      }

      return mDraftModel;
    },

    getEditMode: function () {
      return this.oModel.getProperty("/editMode");
    },

    setEditMode: function (sNewValue) {
      this.oModel.setProperty("/editMode", sNewValue);
    },

    getConfirmation: function () {
      return this.oModel.getProperty("/enableConfirmation");
    },

    setConfirmation: function (sNewValue) {
      this.oModel.setProperty("/enableConfirmation", sNewValue);
    },

    getStartDate: function () {
      return this.oModel.getProperty("/enableStartDate");
    },

    setStartDate: function (sNewValue) {
      this.oModel.setProperty("/enableStartDate", sNewValue);
    },

    getFinishDate: function () {
      return this.oModel.getProperty("/enableFinishDate");
    },

    setFinishDate: function (sNewValue) {
      this.oModel.setProperty("/enableFinishDate", sNewValue);
    },

    getFinishView: function () {
      return this.oModel.getProperty("/finishView");
    },

    setFinishView: function (sNewValue) {
      this.oModel.setProperty("/finishView", sNewValue);
    },

    getSetupPage: function () {
      return this.oModel.getProperty("/setupPage");
    },

    setSetupPage: function (sNewValue) {
      this.oModel.setProperty("/setupPage", sNewValue);
    },

    getLastOperation: function () {
      return this.oModel.getProperty("/lastOperation");
    },

    setLastOperation: function (sNewValue) {
      this.oModel.setProperty("/lastOperation", sNewValue);
    },

    getYield: function () {
      return this.oModel.getProperty("/enableYield");
    },

    setYield: function (sNewValue) {
      this.oModel.setProperty("/enableYield", sNewValue);
    },

    formatTime : function (dValue) {
			var sTime = dValue.getTime();
			
			if (isNaN(sTime)) {
				return;
			}

			var tFormat = DateFormat.getTimeInstance({
				pattern: "PTHH'H'mm'M'ss'S'"
			});

			var sTime = tFormat.format(new Date(sTime));
			return sTime;
		}

  });
});

