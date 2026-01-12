sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, MessageBox, MessageToast, ValueState, DateFormat, Filter, FilterOperator, Fragment) => {
    "use strict";

    return Controller.extend("paymentprototype.controller.payment_prototype", {
        onInit() {
            // Initialize bills data model
            const oBillsModel = new JSONModel([
                {
                    id: "1",
                    feeType: "Semester Fee",
                    description: "Semester 1 2025/2026 - Hostel Accommodation",
                    dueDate: "2026-01-15",
                    amount: "1200.00",
                    currency: "RM",
                    status: "Paid",
                    paidDate: "2026-01-10",
                    receiptId: "RCP-2026-001"
                },
                {
                    id: "2",
                    feeType: "Monthly Fee",
                    description: "January 2026 - Room Rental",
                    dueDate: "2026-01-05",
                    amount: "300.00",
                    currency: "RM",
                    status: "Overdue",
                    paidDate: "",
                    receiptId: ""
                },
                {
                    id: "3",
                    feeType: "Utilities",
                    description: "Water & Electricity - December 2025",
                    dueDate: "2026-02-01",
                    amount: "200.00",
                    currency: "RM",
                    status: "Pending",
                    paidDate: "",
                    receiptId: ""
                },
                {
                    id: "4",
                    feeType: "Deposit",
                    description: "Security Deposit - Refundable",
                    dueDate: "2025-12-15",
                    amount: "500.00",
                    currency: "RM",
                    status: "Paid",
                    paidDate: "2025-12-10",
                    receiptId: "RCP-2025-099"
                },
                {
                    id: "5",
                    feeType: "Monthly Fee",
                    description: "February 2026 - Room Rental",
                    dueDate: "2026-02-05",
                    amount: "300.00",
                    currency: "RM",
                    status: "Pending",
                    paidDate: "",
                    receiptId: ""
                },
                {
                    id: "6",
                    feeType: "Internet Fee",
                    description: "WiFi Subscription - February 2026",
                    dueDate: "2026-02-10",
                    amount: "50.00",
                    currency: "RM",
                    status: "Paid",
                    paidDate: "2026-01-25",
                    receiptId: "RCP-2026-002"
                },
                {
                    id: "7",
                    feeType: "Semester Fee",
                    description: "Semester 2 2025/2026 - Hostel Accommodation",
                    dueDate: "2026-07-15",
                    amount: "1200.00",
                    currency: "RM",
                    status: "Pending",
                    paidDate: "",
                    receiptId: ""
                }
            ]);

            this.getView().setModel(oBillsModel, "bills");
            
            // Initialize counts model for tab badges and total outstanding
            const oCountsModel = new JSONModel({
                allCount: 0,
                overdueCount: 0,
                pendingCount: 0,
                upcomingCount: 0,
                totalOutstanding: "0.00"
            });
            this.getView().setModel(oCountsModel);
            
            // Calculate initial stats
            this._recalculateStats();
            
            // Check for due date reminders on init
            this.checkPaymentReminders();
        },

        /**
         * Recalculate all dashboard statistics
         * Counts bills by status and calculates total outstanding amount
         */
        _recalculateStats() {
            const oBillsModel = this.getView().getModel("bills");
            const aBills = oBillsModel.getData();
            
            // Count bills by status
            let allCount = aBills.length;
            let paidCount = 0;
            let overdueCount = 0;
            let pendingCount = 0;
            let upcomingCount = 0;
            let totalOutstanding = 0;
            
            const oCurrentDate = new Date();
            const oThreeDaysLater = new Date();
            oThreeDaysLater.setDate(oCurrentDate.getDate() + 3);
            
            aBills.forEach((oBill) => {
                const status = oBill.status;
                
                // Count by status
                if (status === "Paid") {
                    paidCount++;
                } else if (status === "Overdue") {
                    overdueCount++;
                    // Add to total outstanding
                    totalOutstanding += parseFloat(oBill.amount);
                } else if (status === "Pending") {
                    pendingCount++;
                    // Add to total outstanding
                    totalOutstanding += parseFloat(oBill.amount);
                    
                    // Check if upcoming (due within 3 days)
                    const oDueDate = new Date(oBill.dueDate);
                    if (oDueDate >= oCurrentDate && oDueDate <= oThreeDaysLater) {
                        upcomingCount++;
                    }
                }
            });
            
            // Update the counts model
            const oCountsModel = this.getView().getModel();
            oCountsModel.setData({
                allCount: allCount,
                paidCount: paidCount,
                overdueCount: overdueCount,
                pendingCount: pendingCount,
                upcomingCount: upcomingCount,
                totalOutstanding: totalOutstanding.toFixed(2)
            });
        },

        /**
         * Update tab counts based on bill statuses
         * @deprecated Use _recalculateStats instead
         */
        updateTabCounts() {
            this._recalculateStats();
        },

        /**
         * Handle tab selection to filter bills table
         * @param {object} oEvent - Tab select event
         */
        onTabSelect(oEvent) {
            const sKey = oEvent.getParameter("key");
            const oTable = this.byId("billsTable");
            const oBinding = oTable.getBinding("items");
            
            let aFilters = [];
            
            if (sKey === "Overdue") {
                aFilters.push(new Filter("status", FilterOperator.EQ, "Overdue"));
            } else if (sKey === "Pending") {
                aFilters.push(new Filter("status", FilterOperator.EQ, "Pending"));
            }
            // "All" tab has no filters
            
            oBinding.filter(aFilters);
        },

        /**
         * Format status text to SAP UI5 ValueState
         * @param {string} sStatus - Status string (Paid, Pending, Overdue)
         * @returns {string} ValueState
         */
        formatStatus(sStatus) {
            const mStatusMap = {
                "Paid": ValueState.Success,
                "Pending": ValueState.Warning,
                "Overdue": ValueState.Error
            };
            return mStatusMap[sStatus] || ValueState.None;
        },

        /**
         * Format status icon based on status
         * @param {string} sStatus - Status string (Paid, Pending, Overdue)
         * @returns {string} Icon name
         */
        formatStatusIcon(sStatus) {
            if (!sStatus) {
                return "";
            }
            
            // Use includes to handle case variations and partial matches
            const statusLower = sStatus.toLowerCase();
            
            if (statusLower.includes("paid")) {
                return "sap-icon://sys-enter-2"; // Checkmark
            } else if (statusLower.includes("overdue")) {
                return "sap-icon://error"; // X mark
            } else if (statusLower.includes("pending")) {
                return "sap-icon://alert"; // Triangle
            }
            
            return "";
        },

        /**
         * Check for bills due within 3 days and show reminders
         */
        checkPaymentReminders() {
            const oBillsModel = this.getView().getModel("bills");
            const aBills = oBillsModel.getData();
            const oCurrentDate = new Date();
            const oThreeDaysLater = new Date();
            oThreeDaysLater.setDate(oCurrentDate.getDate() + 3);

            aBills.forEach((oBill) => {
                if (oBill.status === "Pending") {
                    const oDueDate = new Date(oBill.dueDate);
                    
                    // Check if due within 3 days
                    if (oDueDate >= oCurrentDate && oDueDate <= oThreeDaysLater) {
                        const iDaysLeft = Math.ceil((oDueDate - oCurrentDate) / (1000 * 60 * 60 * 24));
                        MessageToast.show(
                            `Reminder: ${oBill.feeType} (${oBill.currency} ${oBill.amount}) is due in ${iDaysLeft} day(s)!`,
                            {
                                duration: 5000,
                                width: "25em"
                            }
                        );
                    }
                }
            });
        },

        /**
         * Handle Pay Now button press
         * @param {object} oEvent - Button press event
         */
        onPayNow(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("bills");
            const oBill = oContext.getObject();
            
            // Open payment method selection dialog
            if (!this._oPaymentDialog) {
                this._oPaymentDialog = new sap.m.Dialog({
                    title: "Select Payment Method",
                    contentWidth: "400px",
                    content: new sap.m.List({
                        mode: "SingleSelectMaster",
                        selectionChange: this.onSelectPaymentMethod.bind(this),
                        items: [
                            new sap.m.StandardListItem({
                                title: "Online Banking (FPX)",
                                description: "Instant transfer",
                                icon: "sap-icon://money-bills",
                                type: "Active",
                                customData: [new sap.ui.core.CustomData({
                                    key: "method",
                                    value: "fpx"
                                })]
                            }),
                            new sap.m.StandardListItem({
                                title: "E-Wallet",
                                description: "Touch 'n Go, GrabPay, Boost",
                                icon: "sap-icon://wallet",
                                type: "Active",
                                customData: [new sap.ui.core.CustomData({
                                    key: "method",
                                    value: "ewallet"
                                })]
                            }),
                            new sap.m.StandardListItem({
                                title: "Credit/Debit Card",
                                description: "Visa, Mastercard",
                                icon: "sap-icon://card",
                                type: "Active",
                                customData: [new sap.ui.core.CustomData({
                                    key: "method",
                                    value: "card"
                                })]
                            })
                        ]
                    }),
                    beginButton: new sap.m.Button({
                        text: "Cancel",
                        press: () => {
                            this._oPaymentDialog.close();
                        }
                    })
                });
                this.getView().addDependent(this._oPaymentDialog);
            }
            
            // Store selected bill context
            this._oPaymentDialog.data("billContext", oContext);
            this._oPaymentDialog.open();
        },

        /**
         * Handle payment method selection
         * @param {object} oEvent - Selection change event
         */
        onSelectPaymentMethod(oEvent) {
            const oSelectedItem = oEvent.getParameter("listItem");
            const sMethod = oSelectedItem.data("method");
            const sMethodTitle = oSelectedItem.getTitle(); // Get the display title
            const oContext = this._oPaymentDialog.data("billContext");
            const oBill = oContext.getObject();
            
            this._oPaymentDialog.close();
            
            // Open custom confirm payment dialog with selected method title
            this._showConfirmPaymentDialog(oContext, oBill, sMethod, sMethodTitle);
        },

        /**
         * Show the custom Confirm Payment dialog
         * @param {object} oContext - Binding context
         * @param {object} oBill - Bill object
         * @param {string} sMethod - Payment method code
         * @param {string} sMethodTitle - Payment method display title
         */
        _showConfirmPaymentDialog(oContext, oBill, sMethod, sMethodTitle) {
            // Store context and method for later use
            this._pendingPaymentContext = oContext;
            this._pendingPaymentMethod = sMethod;
            this._pendingPaymentMethodTitle = sMethodTitle; // Store the title too
            
            // Determine icon based on payment method
            let sIcon = "sap-icon://official-service"; // Default for Online Banking
            if (sMethodTitle && sMethodTitle.includes("E-Wallet")) {
                sIcon = "sap-icon://iphone";
            } else if (sMethodTitle && sMethodTitle.includes("Credit")) {
                sIcon = "sap-icon://credit-card";
            }
            
            // Prepare confirm data
            const oConfirmData = {
                feeType: oBill.feeType,
                description: oBill.description,
                amount: oBill.amount,
                currency: oBill.currency,
                dueDate: oBill.dueDate,
                paymentMethod: sMethodTitle || "Online Banking (FPX)",
                paymentMethodIcon: sIcon
            };
            
            // Load and open fragment
            if (!this._confirmDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "paymentprototype.view.ConfirmPayment",
                    controller: this
                }).then((oDialog) => {
                    this._confirmDialog = oDialog;
                    this.getView().addDependent(this._confirmDialog);
                    
                    // Set data model
                    const oConfirmModel = new JSONModel(oConfirmData);
                    this._confirmDialog.setModel(oConfirmModel, "confirmData");
                    
                    this._confirmDialog.open();
                });
            } else {
                // Update existing dialog with new data
                const oConfirmModel = new JSONModel(oConfirmData);
                this._confirmDialog.setModel(oConfirmModel, "confirmData");
                this._confirmDialog.open();
            }
        },

        /**
         * Handle confirm payment action
         */
        onConfirmPaymentAction() {
            // Close the confirm dialog
            if (this._confirmDialog) {
                this._confirmDialog.close();
            }
            
            // Execute payment with stored context and method
            if (this._pendingPaymentContext) {
                this.processPayment(this._pendingPaymentContext, this._pendingPaymentMethod);
            }
        },

        /**
         * Close the confirm payment dialog
         */
        onCloseConfirmDialog() {
            if (this._confirmDialog) {
                this._confirmDialog.close();
            }
            // Clear pending payment data
            this._pendingPaymentContext = null;
            this._pendingPaymentMethod = null;
            this._pendingPaymentMethodTitle = null;
        },

        /**
         * Process payment and update bill status
         * @param {object} oContext - Binding context
         * @param {string} sMethod - Payment method code
         */
        processPayment(oContext, sMethod) {
            const oBillsModel = this.getView().getModel("bills");
            const sPath = oContext.getPath();
            const oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
            const sToday = oDateFormat.format(new Date());
            const sReceiptId = `RCP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
            
            // Get the payment method title that was stored
            const sPaymentMethodTitle = this._pendingPaymentMethodTitle || "Online Banking (FPX)";
            
            // Update bill status using model setProperty for proper binding updates
            oBillsModel.setProperty(sPath + "/status", "Paid");
            oBillsModel.setProperty(sPath + "/paidDate", sToday);
            oBillsModel.setProperty(sPath + "/receiptId", sReceiptId);
            oBillsModel.setProperty(sPath + "/paymentMethod", sPaymentMethodTitle);
            
            // Get the updated bill object for display
            const oBill = oContext.getObject();
            
            // Recalculate all statistics after payment
            this._recalculateStats();
            
            // Open beautiful success dialog
            this._showPaymentSuccessDialog(oBill);
            
            // Store context for later download
            this._lastPaymentContext = oContext;
        },

        /**
         * Show the beautiful Payment Success dialog
         * @param {object} oBill - The paid bill object
         */
        _showPaymentSuccessDialog(oBill) {
            // Prepare success data with wallet balance
            const oSuccessData = {
                amount: oBill.amount,
                currency: oBill.currency,
                receiptId: oBill.receiptId,
                paidDate: oBill.paidDate,
                walletBalance: "2,500.00" // Mock wallet balance - replace with actual data
            };
            
            // Load and open fragment
            if (!this._successDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "paymentprototype.view.PaymentSuccess",
                    controller: this
                }).then((oDialog) => {
                    this._successDialog = oDialog;
                    this.getView().addDependent(this._successDialog);
                    
                    // Set data model
                    const oSuccessModel = new JSONModel(oSuccessData);
                    this._successDialog.setModel(oSuccessModel, "successData");
                    
                    this._successDialog.open();
                });
            } else {
                // Update existing dialog with new data
                const oSuccessModel = new JSONModel(oSuccessData);
                this._successDialog.setModel(oSuccessModel, "successData");
                this._successDialog.open();
            }
        },

        /**
         * Close the success dialog
         */
        onCloseSuccessDialog() {
            if (this._successDialog) {
                this._successDialog.close();
            }
        },

        /**
         * Download receipt after successful payment
         */
        onDownloadAfterSuccess() {
            // Close success dialog first
            this.onCloseSuccessDialog();
            
            // Open receipt dialog with the last payment context
            if (this._lastPaymentContext) {
                const oBill = this._lastPaymentContext.getObject();
                
                // Prepare receipt data
                const oReceiptData = {
                    receiptId: oBill.receiptId,
                    paidDate: oBill.paidDate,
                    studentName: "Choh Jing Yi",
                    feeType: oBill.feeType,
                    description: oBill.description,
                    amount: oBill.amount,
                    currency: oBill.currency,
                    paymentMethod: oBill.paymentMethod || "Online Banking (FPX)"
                };
                
                // Load receipt dialog
                if (!this._receiptDialog) {
                    Fragment.load({
                        id: this.getView().getId(),
                        name: "paymentprototype.view.ReceiptDialog",
                        controller: this
                    }).then((oDialog) => {
                        this._receiptDialog = oDialog;
                        this.getView().addDependent(this._receiptDialog);
                        
                        const oReceiptModel = new JSONModel(oReceiptData);
                        this._receiptDialog.setModel(oReceiptModel, "receiptData");
                        
                        this._receiptDialog.open();
                    });
                } else {
                    const oReceiptModel = new JSONModel(oReceiptData);
                    this._receiptDialog.setModel(oReceiptModel, "receiptData");
                    this._receiptDialog.open();
                }
            }
        },

        /**
         * Download receipt for paid bills - Opens professional receipt dialog
         * @param {object} oEvent - Button press event
         */
        onDownloadReceipt(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("bills");
            const oBill = oContext.getObject();
            
            if (oBill.status !== "Paid") {
                MessageToast.show("Receipt is only available for paid bills");
                return;
            }
            
            // Prepare receipt data
            const oReceiptData = {
                receiptId: oBill.receiptId,
                paidDate: oBill.paidDate,
                studentName: "Choh Jing Yi",
                feeType: oBill.feeType,
                description: oBill.description,
                amount: oBill.amount,
                currency: oBill.currency,
                paymentMethod: oBill.paymentMethod || "Online Banking (FPX)"
            };
            
            // Create and set model for the fragment
            const oReceiptModel = new JSONModel(oReceiptData);
            
            // Load and open the receipt dialog fragment
            if (!this._receiptDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "paymentprototype.view.ReceiptDialog",
                    controller: this
                }).then((oDialog) => {
                    this._receiptDialog = oDialog;
                    this.getView().addDependent(this._receiptDialog);
                    this._receiptDialog.setModel(oReceiptModel, "receiptData");
                    this._receiptDialog.open();
                });
            } else {
                this._receiptDialog.setModel(oReceiptModel, "receiptData");
                this._receiptDialog.open();
            }
        },

        /**
         * Download PDF handler
         */
        onDownloadPdf() {
            MessageToast.show("Downloading PDF...");
            // In real app: trigger actual PDF download
            setTimeout(() => {
                MessageToast.show("Receipt downloaded successfully!");
            }, 1000);
        },

        /**
         * Close receipt dialog
         */
        onCloseReceiptDialog() {
            if (this._receiptDialog) {
                this._receiptDialog.close();
            }
        },

        /**
         * Refresh data
         */
        onRefresh() {
            const oBillsModel = this.getView().getModel("bills");
            oBillsModel.refresh(true);
            this._recalculateStats();
            MessageToast.show("Data refreshed");
            this.checkPaymentReminders();
        }
    });
});