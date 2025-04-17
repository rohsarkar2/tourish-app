import Colors from "./Colors";

const FlightStatus = {
	ACTIVE: "A",
	CANCELLED: "C",
	DIVERTED: "D",
	DATA_NEEDED: "DN",
	LANDED: "L",
	NOT_OPERATIONAL: "NO",
	REDIRECTED: "R",
	SCHEDULED: "S",
	UNKNOWN: "U",
};

export const FlightStatusText = {
	ACTIVE: "Active", // blue
	CANCELLED: "Cancelled", //danger
	DIVERTED: "Diverted", // warning
	DATA_NEEDED: "Data Needed", // warning
	LANDED: "Landed", //success
	NOT_OPERATIONAL: "Not Operational", //danger
	REDIRECTED: "Redirected", ////danger
	SCHEDULED: "Scheduled", // primarybg
	UNKNOWN: "Unknown", //grey
};

export const FlightStatusBackgroundColor = {
	ACTIVE: "rgba(60, 156, 225, 0.2)",
	CANCELLED: "rgba(220, 53, 69, 0.2)",
	DIVERTED: "rgba(235, 179, 12, 0.2)",
	DATA_NEEDED: "rgba(235, 179, 12, 0.2)",
	LANDED: "rgba(122, 229, 130, 0.2)",
	NOT_OPERATIONAL: "rgba(220, 53, 69, 0.2)",
	REDIRECTED: "rgba(220, 53, 69, 0.2)",
	SCHEDULED: "rgba(21, 189, 216, 0.2)",
	UNKNOWN: "rgba(150, 150, 150, 0.2)",
};

export const FlightStatusBorderColor = {
	ACTIVE: Colors.primary,
	CANCELLED: Colors.danger,
	DIVERTED: Colors.warning,
	DATA_NEEDED: Colors.warning,
	LANDED: "rgba(122, 229, 130, 1)",
	NOT_OPERATIONAL: Colors.danger,
	REDIRECTED: Colors.danger,
	SCHEDULED: Colors.primaryBg,
	UNKNOWN: Colors.mediumGrey,
};

export const FlightStatusTextColor = {
	ACTIVE: Colors.primary,
	CANCELLED: Colors.danger,
	DIVERTED: Colors.warning,
	DATA_NEEDED: Colors.warning,
	LANDED: "rgba(122, 229, 130, 1)",
	NOT_OPERATIONAL: Colors.danger,
	REDIRECTED: Colors.danger,
	SCHEDULED: Colors.primaryBg,
	UNKNOWN: Colors.mediumGrey,
};

export const FlightStatusIconBackgroundColor = {
	ACTIVE: Colors.primary,
	CANCELLED: Colors.danger,
	DIVERTED: Colors.warning,
	DATA_NEEDED: Colors.warning,
	LANDED: "rgba(122, 229, 130, 1)",
	NOT_OPERATIONAL: Colors.danger,
	REDIRECTED: Colors.danger,
	SCHEDULED: Colors.primaryBg,
	UNKNOWN: Colors.mediumGrey,
};

export default FlightStatus;
