/*global QUnit*/

sap.ui.define([
	"paymentprototype/controller/payment_prototype.controller"
], function (Controller) {
	"use strict";

	QUnit.module("payment_prototype Controller");

	QUnit.test("I should test the payment_prototype controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
