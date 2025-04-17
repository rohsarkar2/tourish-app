import Colors from "./Colors";

export const DataPackageStatus = {
	AVAILABLE: "Available", //success
	DEPLETED: "Depleted", //warning
	EXPIRED: "Expired", //danger
};

export const DataPackageStatusBackgroundColor = {
	AVAILABLE: "rgba(122, 229, 130, 0.2)",
	EXPIRED: "rgba(220, 53, 69, 0.2)",
	DEPLETED: "rgba(235, 179, 12, 0.2)",
};

export const DataPackageStatusBorderColor = {
	AVAILABLE: "rgba(122, 229, 130, 1)",
	EXPIRED: Colors.danger,
	DEPLETED: Colors.warning,
};

export const DataPackageStatusIconBackgroundColor = {
	AVAILABLE: "rgba(122, 229, 130, 1)",
	EXPIRED: Colors.danger,
	DEPLETED: Colors.warning,
};
