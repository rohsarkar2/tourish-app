import Colors from "./Colors";

export const SimtexType = {
	FIRST_RECHARGE: "First Recharge",
	TOP_UP_RECHARGE: "Top Up Recharge",
};

export const EsimStatus = {
	PENDING: "Pending", //yellow
	ACTIVE: "Active", //success
	REPLACED: "Replaced", //primarybg
	CANCELLED: "Cancelled", //danger
};

export const EsimStatusText = {
	PENDING: "Pending",
	ACTIVE: "Active", // success
	REPLACED: "Replaced",
	CANCELLED: "Cancelled", //danger
};

export const EsimStatusBackgroundColor = {
	PENDING: "rgba(235, 179, 12, 0.2)",
	ACTIVE: "rgba(122, 229, 130, 0.2)", // success
	REPLACED: "rgba(21, 189, 216, 0.2)",
	CANCELLED: "rgba(220, 53, 69, 0.2)", //danger
};

export const EsimStatusBorderColor = {
	PENDING: Colors.warning,
	ACTIVE: "rgba(122, 229, 130, 1)", // success
	REPLACED: Colors.primaryBg,
	CANCELLED: Colors.danger, //danger
};

export const EsimStatusTextColor = {
	PENDING: Colors.warning,
	ACTIVE: "rgba(122, 229, 130, 1)", // success
	REPLACED: Colors.primaryBg,
	CANCELLED: Colors.danger, //danger
};

export const EsimStatusIconBackgroundColor = {
	PENDING: Colors.warning,
	ACTIVE: "rgba(122, 229, 130, 1)", // success
	REPLACED: Colors.primaryBg,
	CANCELLED: Colors.danger, //danger
};
