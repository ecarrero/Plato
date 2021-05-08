sap.ui.define([
  "sap/ui/base/Object",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (BaseObject, Filter, FilterOperator, JSONModel) {

  return BaseObject.extend("com.plato.combinedorderstimes.model.ODatatModel", {
    oModel: null,
    oJSONModel: null,

    constructor: function (oComponentCtrl, sModel) {
      this.oModel = oComponentCtrl.getOwnerComponent().getModel(sModel);
    },

    getEntity : function (sEntity) {
      return new Promise((resolve, reject) => {
        this.oModel.read(sEntity, {
          success: (response) => {
            resolve(response);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    },

    getEntitySet : function (sEntity, aFilter) {
      return new Promise((resolve, reject) => {
        this.oModel.read(sEntity, {
          filters: [aFilter],
          success: (response) => {
            resolve(response);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    },

    create: function (sEntitySet, sParameters) {
      return new Promise((resolve, reject) => {
        this.oModel.create(sEntitySet, sParameters, {
          success: (response) => {
            resolve(response);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    },

    getOperationsByOrderID: async function (sKey, iSelectedOperation, sOrderID, oTable, oUIModel) {
      var mKey = {};
      mKey.Counter = iSelectedOperation;
      mKey.Order = sKey;    

      try {
        var sPath = this.oModel.createKey("/OrderCombinationSet", mKey);
        var sResponse = await this.getEntity(sPath);

        if (sResponse.FlagLastOperation) {          
          var aFilters = [];
          aFilters.push(new Filter("Aufnr", FilterOperator.EQ, sOrderID));
          var that = this;
        
          this.getEntitySet("/OrderItemsSet", aFilters)
            .then( function(oData) {
              var oJSONModel = new JSONModel();                 
              oJSONModel.setData(oData.results);   
              
              if (oTable === undefined) {
                that.oJSONModel = oJSONModel;
              } else {
                oTable.setModel(oJSONModel, "orderItems");
					
                oTable.bindItems({
                  path: "orderItems>/",
                  template : oTable.getBindingInfo("items").template
                });
              }
              
              oUIModel.setLastOperation(sResponse.FlagLastOperation);
				      oUIModel.setYield(!sResponse.FlagLastOperation);
            })
            .catch( function(error) {
              oUIModel.setLastOperation(false);
            });
        } else {          
          oUIModel.setLastOperation(sResponse.FlagLastOperation);
          oUIModel.setYield(!sResponse.FlagLastOperation);
        }
      } catch (err) {
        oUIModel.setLastOperation(false);
      }
    },

    getJSONModel : function () {
      return this.oJSONModel;
    }
  });
});

