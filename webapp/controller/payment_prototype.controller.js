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
                studentName: "Jing Yi",
                totalOutstanding: "RM 550.00"
            });

            this.getView().setModel(oPaymentModel, "paymentModel");
        },

        onPayFee() {
            MessageBox.confirm(
                "Proceed to payment gateway?",
                {
                    title: "Confirm Payment",
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            MessageToast.show("Redirecting to secure payment gateway...");
                        }
                    }
                }
            );
        },

        onGenerateReceipt() {
            MessageBox.success(
                "Receipt generated successfully!\n\nReceipt will be sent to your registered email.",
                {
                    title: "Receipt Generated",
                    onClose: () => {
                        MessageToast.show("Receipt sent to your email!");
                    }
                }
            );
        },

        onPayAll() {
            MessageBox.confirm(
                "Pay all outstanding fees?\n\nTotal: RM 550.00",
                {
                    title: "Pay All Outstanding Fees",
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            MessageToast.show("Redirecting to secure payment gateway...");
                        }
                    }
                }
            );
        },

        onBankTransfer() {
            MessageBox.information(
                "Bank Transfer Details:\n\n" +
                "Account Name: Hostel Management\n" +
                "Account Number: 1234567890\n" +
                "Bank: National Bank\n" +
                "IFSC: NBNK0001234\n\n" +
                "Please mention your student ID in the remarks.",
                {
                    title: "Bank Transfer",
                    onClose: () => {
                        MessageToast.show("Payment details copied!");
                    }
                }
            );
        },

        onEWallet() {
            MessageBox.information(
                "E-Wallet Payment:\n\n" +
                "Supported: PayPal, Google Pay, Apple Pay\n\n" +
                "Click OK to proceed to payment gateway.",
                {
                    title: "E-Wallet Payment",
                    onClose: () => {
                        MessageToast.show("Redirecting to payment gateway...");
                    }
                }
            );
        },

        onCreditCard() {
            MessageBox.information(
                "Credit Card Payment:\n\n" +
                "Secure Payment Gateway\n\n" +
                "Accepted: Visa, Mastercard, American Express",
                {
                    title: "Credit Card Payment",
                    onClose: () => {
                        MessageToast.show("Redirecting to payment gateway...");
                    }
                }
            );
        }
    });
});