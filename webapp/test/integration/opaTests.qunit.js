/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["paymentprototype/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
