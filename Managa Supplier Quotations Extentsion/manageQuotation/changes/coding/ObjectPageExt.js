/***
@controller Name:sap.suite.ui.generic.template.ObjectPage.view.Details,
*@viewId:s2p.mm.pur.qtn.maintains1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_SuplrQuotationEnhWD
*/
sap.ui.define([
        'sap/ui/core/mvc/ControllerExtension',
        'sap/m/MenuItem',
        'sap/m/Button'
		// ,'sap/ui/core/mvc/OverrideExecution'
	],
	function (
        ControllerExtension,
        MenuItem,
        Button
		// ,OverrideExecution
	) {
		"use strict";
		return ControllerExtension.extend("zmm_qtn_mains1.ObjectPageExt", {
			// metadata: {
			// 	// extension can declare the public methods
			// 	// in general methods that starts with "_" are private
			// 	methods: {
			// 		publicMethod: {
			// 			public: true /*default*/ ,
			// 			final: false /*default*/ ,
			// 			overrideExecution: OverrideExecution.Instead /*default*/
			// 		},
			// 		finalPublicMethod: {
			// 			final: true
			// 		},
			// 		onMyHook: {
			// 			public: true /*default*/ ,
			// 			final: false /*default*/ ,
			// 			overrideExecution: OverrideExecution.After
			// 		},
			// 		couldBePrivate: {
			// 			public: false
			// 		}
			// 	}
            // },
            
            onCreateFollowOnPOAdvanced: function(oEvent) {
                var oModel = this.getView().getModel();
                var sPath = oEvent.getSource().getBindingContext().getPath();
                var sPO = oModel.getProperty(sPath).SupplierQuotation;
                this.oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");

                if (this.oCrossAppNavigator && this.oCrossAppNavigator.toExternal) {
                    this.oCrossAppNavigator.toExternal({
                        target: {
                            semanticObject: "PurchaseOrder",
                            action: "createFromFLP"
                        },
                        params: {
                            "PurchasingDocument": sPO,
                            "flavor": "005056A9E9F11EEB9DEBB8F85CB2CE2F",
                            "transaction": "ZME21N"
                        }
                    });
                }
            },

			// // adding a private method, only accessible from this controller extension
			// _privateMethod: function() {},
			// // adding a public method, might be called or overridden from other controller extensions as well
			// publicMethod: function() {},
			// // adding final public method, might be called but not overridden from other controller extensions as well
			// finalPublicMethod: function() {},
			// // adding a hook method, might be called or overridden from other controller extensions.
			// // override these method does not replace the implementation, but executes after the original method.
			// onMyHook: function() {},
			// // method per default public, but made private per metadata
			// couldBePrivate: function() {},
			// // this section allows to extend lifecycle hooks or override public methods of the base controller
			override: {
			// 	/**
			// 	 * Called when a controller is instantiated and its View controls (if available) are already created.
			// 	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			// 	 * @memberOf zmm_qtn_mains1.ObjectPageExt
			// 	 */
			// 	onInit: function() {
			// 	},

			// 	/**
			// 	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			// 	 * (NOT before the first rendering! onInit() is used for that one!).
			// 	 * @memberOf zmm_qtn_mains1.ObjectPageExt
			// 	 */
			// 	onBeforeRendering: function() {
			// 	},

			// 	/**
			// 	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
			// 	 * This hook is the same one that SAPUI5 controls get after being rendered.
			// 	 * @memberOf zmm_qtn_mains1.ObjectPageExt
			// 	 */
				onAfterRendering: function() {
                    var oItem = "";
                    var oActions = this.getView().getAggregation("content")[0].getAggregation("headerTitle").getAggregation("actions");

                    var oButton = oActions.find( function (mAction) {
                        return mAction.getId() === "s2p.mm.pur.qtn.maintains1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_SuplrQuotationEnhWD--action::createFollowOnPO";
                    })
                    
                    if (oButton === undefined) {
                        //Menu option
                        oActions.some( function (mAction) {
                            if (mAction.getAggregation("menu") !== null) {
                                oItem = mAction.getAggregation("menu").getAggregation("items").find( function (mItem) {
                                    return mItem.getId() === "__component0---id-1532012591527-433-originalButtonId";
                                }, this)

                                if (oItem === undefined) {                                    
                                    return false;
                                } else {
                                    oItem.setVisible(false);

                                    var oMenuItem = new MenuItem({
                                        text: this.getView().getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_SuplrQuotationEnhWD").getResourceBundle().getText("btnCreatePOAdv"),
                                        press: [this.onCreateFollowOnPOAdvanced, this]
                                    })

                                    mAction.getAggregation("menu").addItem(oMenuItem);
                                    return true;
                                }                                   
                            }                            
                        }, this)                        
                    } else {
                        //Menu has been splitted automatically by the app
                        if (oButton.getId() === "s2p.mm.pur.qtn.maintains1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_SuplrQuotationEnhWD--action::createFollowOnPO") {
                            var oButtonPO = new Button({
                                text: this.getView().getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_SuplrQuotationEnhWD").getResourceBundle().getText("btnCreatePOAdv"),
                                press: [this.onCreateFollowOnPOAdvanced, this]
                            })

                            var oParent = oButton.getParent();
                            var iBtnIndex = oButton.position;
                            oButton.setVisible(false);
                            oParent.insertAction(oButtonPO, iBtnIndex);
                        }                        
                    }
				},

			// 	/**
			// 	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
			// 	 * @memberOf zmm_qtn_mains1.ObjectPageExt
			// 	 */
			// 	onExit: function() {
			// 	},

			// 	override public method of the base controller
			//	"templateBaseExtension": {
			/**
			 * Can be used to make sure that certain fields will be contained in the select clause of the table binding. 
			 * This should be used, when custom logic of the extension depends on these fields.
			 * sControlId is the ID of the control on which extension logic to be applied.
			 * For each custom field the extension must call fnEnsureSelectionProperty(oControllerExtension, sFieldname).
			 * oControllerExtension must be the ControllerExtension instance which ensures the field to be part of the select clause.				
			 * sFieldname must specify the field to be selected. Note that this must either be a field of the entity set itself or a field which can be reached via a :1 navigation property.
			 * In the second case sFieldname must contain the relative path.
			 */
			//	ensureFieldsForSelect: function(fnEnsureSelectionProperty, sControlId){
			//myControlId is the Id of the control to which the extension has been added
			/*if(myControlId == sControlId) {
				fnEnsureSelectionProperty(oControllerExtension, sFieldname);
			}*/
			//	},
			/**
			 * Can be used to add filters. They will be combined via AND with all other filters
			 * sControlId is the ID of the control on which extension logic to be applied.
			 * For each filter the extension must call fnAddFilter(oControllerExtension, oFilter)
			 * oControllerExtension must be the ControllerExtension instance which adds the filter
			 * oFilter must be an instance of sap.ui.model.Filter
			 */
			//addFilters: function(fnAddFilter, sControlId){
			//myControlId is the Id of the control to which the extension has been added
			/*if(myControlId == sControlId) {
				var oFilter = new sap.ui.model.Filter(vFilterInfo, vOperator?, vValue1?, vValue2?),
				fnAddFilter(oControllerExtension, oFilter);	
			}*/
			//	},
			/**
			 * Can be used to store specific state. Therefore, the implementing controller extension must call fnSetExtensionStateData(oControllerExtension, oExtensionState).
			 * oControllerExtension must be the ControllerExtension instance for which the state should be stored. oExtensionState is the state to be stored.
			 * Note that the call is ignored if oExtensionState is faulty
			 */
			//provideExtensionStateData: function(fnSetExtensionStateData){
			/*var oExtensionState = Object.create(null);//Create a new object
				oExtensionState.<myKeyName> = {
						data: <myPropertyValue>,
						lifecycle: {//provide values for lifecycle parameters
							permanent : true,
							page : false,
							session : true,
							pagination : false
						}
				}
			fnSetExtensionStateData(this, oExtensionState);*/
			//},
			/**
			 * Can be used extensions to restore their state according to a state which was previously stored.
			 * Therefore, the implementing controller extension can call fnGetExtensionStateData(oControllerExtension) in order to retrieve the state information which has been stored in the current state for this controller extension.
			 * undefined will be returned by this function if no state or a faulty state was stored.
			 * bIsSameAsLast is a boolean and a value of true indicates that the state needs not to be adapted, since view is like we left it the last time
			 */
			//restoreExtensionStateData: function(fnGetExtensionStateData, bIsSameAsLast){				
			//var oExtensionState = fnGetExtensionStateData(this);//get extensionState object
			//}
			//	}
			}
		});
	});