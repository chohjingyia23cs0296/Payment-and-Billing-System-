sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, MessageBox, MessageToast, ValueState, DateFormat, Filter, FilterOperator) => {
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
            
            // Initialize counts model for tab badges
            const oCountsModel = new JSONModel({
                allCount: 0,
                overdueCount: 0,
                pendingCount: 0
            });
            this.getView().setModel(oCountsModel);
            
            // Calculate initial counts
            this.updateTabCounts();
            
            // Check for due date reminders on init
            this.checkPaymentReminders();
        },

        /**
         * Update tab counts based on bill statuses
         */
        updateTabCounts() {
            const oBillsModel = this.getView().getModel("bills");
            const aBills = oBillsModel.getData();
            
            const oCounts = {
                allCount: aBills.length,
                overdueCount: aBills.filter(b => b.status === "Overdue").length,
                pendingCount: aBills.filter(b => b.status === "Pending").length
            };
            
            this.getView().getModel().setData(oCounts);
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
            const mIconMap = {
                "Paid": "sap-icon://message-success",
                "Pending": "sap-icon://warning",
                "Overdue": "sap-icon://alert"
            };
            return mIconMap[sStatus] || "";
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
            const oContext = this._oPaymentDialog.data("billContext");
            const oBill = oContext.getObject();
            
            this._oPaymentDialog.close();
            
            // Simulate payment processing
            MessageBox.confirm(
                `Pay ${oBill.currency} ${oBill.amount} for ${oBill.feeType} via ${oSelectedItem.getTitle()}?`,
                {
                    title: "Confirm Payment",
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            this.processPayment(oContext, sMethod);
                        }
                    }
                }
            );
        },

        /**
         * Process payment and update bill status
         * @param {object} oContext - Binding context
         * @param {string} sMethod - Payment method
         */
        processPayment(oContext, sMethod) {
            const oBill = oContext.getObject();
            const oDateFormat = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
            const sToday = oDateFormat.format(new Date());
            
            // Update bill status
            oBill.status = "Paid";
            oBill.paidDate = sToday;
            oBill.receiptId = `RCP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
            
            const oBillsModel = this.getView().getModel("bills");
            oBillsModel.refresh(true);
            
            // Update tab counts after payment
            this.updateTabCounts();
            
            MessageBox.success(
                `Payment successful!\n\nReceipt ID: ${oBill.receiptId}\nAmount: ${oBill.currency} ${oBill.amount}`,
                {
                    title: "Payment Confirmed",
                    onClose: () => {
                        MessageToast.show("Receipt is available for download");
                    }
                }
            );
        },

        /**
         * Download receipt for paid bills
         * @param {object} oEvent - Button press event
         */
        onDownloadReceipt(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("bills");
            const oBill = oContext.getObject();
            
            if (oBill.status !== "Paid") {
                MessageToast.show("Receipt is only available for paid bills");
                return;
            }
            
            // Simulate PDF receipt generation
            const sReceiptContent = this.generateReceiptContent(oBill);
            
            MessageBox.information(
                sReceiptContent,
                {
                    title: "Receipt Preview",
                    contentWidth: "400px",
                    styleClass: "receiptDialog",
                    actions: [
                        new sap.m.Button({
                            text: "Download",
                            icon: "sap-icon://download",
                            press: () => {
                                MessageToast.show("Receipt downloaded successfully!");
                                // In real app: trigger actual PDF download
                            }
                        }),
                        MessageBox.Action.CLOSE
                    ]
                }
            );
        },

        /**
         * Generate receipt content
         * @param {object} oBill - Bill object
         * @returns {string} Receipt HTML content
         */
        generateReceiptContent(oBill) {
            return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HOSTEL PAYMENT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt ID:    ${oBill.receiptId}
Date:          ${oBill.paidDate}
Student:       Current User

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Description:   ${oBill.feeType}
Details:       ${oBill.description}
Amount:        ${oBill.currency} ${oBill.amount}
Status:        ${oBill.status}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your payment!
            `.trim();
        },

        /**
         * Refresh data
         */
        onRefresh() {
            const oBillsModel = this.getView().getModel("bills");
            oBillsModel.refresh(true);
            this.updateTabCounts();
            MessageToast.show("Data refreshed");
            this.checkPaymentReminders();
        }
    });
});