sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("paymentprototype.controller.payment_prototype", {
        onInit() {
            // Initialize payment data model
            const oPaymentModel = new JSONModel({
                // Fee Records Data
                feeRecords: [
                    {
                        feeType: "Deposit",
                        amount: "$500.00",
                        dueDate: "2025-12-15",
                        paidDate: "2025-12-10",
                        status: "Paid",
                        statusState: "Success",
                        enablePay: false,
                        enableReceipt: true
                    },
                    {
                        feeType: "Semester Fee",
                        amount: "$1,200.00",
                        dueDate: "2026-01-15",
                        paidDate: "2026-01-12",
                        status: "Paid",
                        statusState: "Success",
                        enablePay: false,
                        enableReceipt: true
                    },
                    {
                        feeType: "Monthly Fee",
                        amount: "$300.00",
                        dueDate: "2026-02-01",
                        paidDate: "",
                        status: "Pending",
                        statusState: "Warning",
                        enablePay: true,
                        enableReceipt: false
                    },
                    {
                        feeType: "Monthly Fee",
                        amount: "$300.00",
                        dueDate: "2026-01-05",
                        paidDate: "",
                        status: "Overdue",
                        statusState: "Error",
                        enablePay: true,
                        enableReceipt: false
                    },
                    {
                        feeType: "Utilities",
                        amount: "$200.00",
                        dueDate: "2026-02-10",
                        paidDate: "",
                        status: "Pending",
                        statusState: "Warning",
                        enablePay: true,
                        enableReceipt: false
                    },
                    {
                        feeType: "Semester Fee",
                        amount: "$1,200.00",
                        dueDate: "2026-07-15",
                        paidDate: "",
                        status: "Pending",
                        statusState: "Warning",
                        enablePay: true,
                        enableReceipt: false
                    }
                ],
                
                // Payment Reminders
                reminders: [
                    {
                        feeType: "Monthly Fee (February)",
                        dueDate: "Due: 2026-02-01",
                        amount: "$300.00",
                        status: "Warning"
                    },
                    {
                        feeType: "Utilities",
                        dueDate: "Due: 2026-02-10",
                        amount: "$200.00",
                        status: "Information"
                    },
                    {
                        feeType: "Monthly Fee (January) - OVERDUE",
                        dueDate: "Was Due: 2026-01-05",
                        amount: "$300.00",
                        status: "Error"
                    }
                ],

                // Filter Options
                feeTypes: [
                    { key: "all", text: "All Fee Types" },
                    { key: "deposit", text: "Deposit" },
                    { key: "semester", text: "Semester Fee" },
                    { key: "monthly", text: "Monthly Fee" },
                    { key: "utilities", text: "Utilities" }
                ],
                selectedFeeType: "all",

                statuses: [
                    { key: "all", text: "All Status" },
                    { key: "paid", text: "Paid" },
                    { key: "pending", text: "Pending" },
                    { key: "overdue", text: "Overdue" }
                ],
                selectedStatus: "all",

                // Payment Methods
                paymentMethods: [
                    { key: "bank_transfer", text: "Bank Transfer" },
                    { key: "e_wallet", text: "E-Wallet" },
                    { key: "credit_card", text: "Credit Card" }
                ]
            });

            this.getView().setModel(oPaymentModel, "paymentModel");
        },

        onPayFee(oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("paymentModel");
            const oData = oContext.getObject();
            
            MessageBox.confirm(
                `Pay ${oData.feeType} of ${oData.amount}?`,
                {
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            // Update status to Paid
                            oData.status = "Paid";
                            oData.statusState = "Success";
                            oData.paidDate = new Date().toISOString().split('T')[0];
                            oData.enablePay = false;
                            oData.enableReceipt = true;
                            
                            const oModel = this.getView().getModel("paymentModel");
                            oModel.refresh(true);
                            
                            MessageToast.show("Payment processed successfully!");
                        }
                    }
                }
            );
        },

        onGenerateReceipt(oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("paymentModel");
            const oData = oContext.getObject();
            
            MessageBox.information(
                `Receipt generated for:\n\nFee Type: ${oData.feeType}\nAmount: ${oData.amount}\nDate: ${oData.paidDate}\n\nReceipt will be sent via email.`,
                {
                    title: "Receipt Generation",
                    onClose: () => {
                        MessageToast.show("Receipt sent to registered email!");
                    }
                }
            );
        },

        onBankTransfer() {
            MessageBox.information(
                "Bank Transfer Details:\n\nAccount Name: Hostel Management\nAccount Number: 1234567890\nBank: National Bank\nIFSC: NBNK0001234\n\nPlease mention your student ID in the remarks.",
                {
                    title: "Bank Transfer"
                }
            );
        },

        onEWallet() {
            MessageBox.information(
                "E-Wallet Payment:\n\nSupported: PayPal, Google Pay, Apple Pay\n\nClick the button below to proceed to payment gateway.",
                {
                    title: "E-Wallet Payment"
                }
            );
            MessageToast.show("Redirecting to payment gateway...");
        },

        onCreditCard() {
            MessageBox.information(
                "Credit Card Payment:\n\nSecure Payment Gateway\n\nAccepted Cards: Visa, Mastercard, American Express",
                {
                    title: "Credit Card Payment"
                }
            );
            MessageToast.show("Redirecting to payment gateway...");
        }
    });
});