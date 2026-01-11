sap.ui.define([
	"sap.ui.core.mvc.Controller",
	"sap.ui.model.json.JSONModel",
	"sap.m.MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("paymentprototype.controller.PaymentBilling", {

		onInit: function () {
			// Initialize payment data model
			var oPaymentModel = new JSONModel({
				customerName: "",
				amount: "",
				invoiceNumber: "",
				selectedMethod: "credit_card",
				dueDate: new Date().toISOString().split('T')[0],
				paymentMethods: [
					{ key: "credit_card", text: "Credit Card" },
					{ key: "bank_transfer", text: "Bank Transfer" },
					{ key: "check", text: "Check" },
					{ key: "cash", text: "Cash" }
				],
				billingHistory: [
					{
						invoiceNumber: "INV-001",
						customerName: "John Doe",
						amount: "$1,500.00",
						method: "Credit Card",
						date: "2026-01-10",
						status: "Paid",
						statusState: "Success"
					},
					{
						invoiceNumber: "INV-002",
						customerName: "Jane Smith",
						amount: "$2,300.00",
						method: "Bank Transfer",
						date: "2026-01-09",
						status: "Paid",
						statusState: "Success"
					},
					{
						invoiceNumber: "INV-003",
						customerName: "ABC Corp",
						amount: "$5,000.00",
						method: "Check",
						date: "2026-01-08",
						status: "Pending",
						statusState: "Warning"
					}
				]
			});

			this.getView().setModel(oPaymentModel, "paymentModel");
		},

		onSubmitPayment: function () {
			var oModel = this.getView().getModel("paymentModel");
			var oData = oModel.getData();

			// Validation
			if (!oData.customerName || !oData.amount || !oData.invoiceNumber) {
				MessageBox.error("Please fill in all required fields");
				return;
			}

			// Add payment to history
			var oNewPayment = {
				invoiceNumber: oData.invoiceNumber,
				customerName: oData.customerName,
				amount: "$" + parseFloat(oData.amount).toFixed(2),
				method: this._getPaymentMethodName(oData.selectedMethod),
				date: new Date().toISOString().split('T')[0],
				status: "Paid",
				statusState: "Success"
			};

			oData.billingHistory.unshift(oNewPayment);
			oModel.refresh();

			MessageBox.success("Payment submitted successfully!");
			this.onReset();
		},

		onReset: function () {
			var oModel = this.getView().getModel("paymentModel");
			oModel.setData({
				...oModel.getData(),
				customerName: "",
				amount: "",
				invoiceNumber: "",
				selectedMethod: "credit_card",
				dueDate: new Date().toISOString().split('T')[0]
			});
		},

		_getPaymentMethodName: function (sKey) {
			var mPaymentMethods = {
				"credit_card": "Credit Card",
				"bank_transfer": "Bank Transfer",
				"check": "Check",
				"cash": "Cash"
			};
			return mPaymentMethods[sKey] || sKey;
		}
	});
});
