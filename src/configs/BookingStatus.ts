import Colors from "./Colors";

const BookingStatus = {
	PENDING: "PENDING", //warning
	ACCEPTED: "ACCEPTED", //primary
	REJECTED: "REJECTED", //danger
	CONFIRMED: "CONFIRMED", //success
	RESCHEDULE_CONFIRMED: "RESCHEDULED", //primaryb
	CANCELLED: "CANCELLED",
};

export const BookingPaymentStatus = {
	PAID: "PAID",
	FAILED: "FAILED",
};

export const BookingStatusBackgroundColor = {
	PENDING: "rgba(235, 179, 12, 0.2)",
	ACCEPTED: "rgba(21, 189, 216, 0.2)", // success
	CONFIRMED: "rgba(122, 229, 130, 0.2)",
	RESCHEDULE_CONFIRMED: "rgba(60, 156, 225, 0.2)",
	CANCELLED: "rgba(220, 53, 69, 0.2)", //danger
	REJECTED: "rgba(220, 53, 69, 0.2)", //danger
};

export const BookingStatusBorderColor = {
	PENDING: Colors.warning,
	ACCEPTED: Colors.primaryBg, // success
	CONFIRMED: "rgba(122, 229, 130, 1)",
	RESCHEDULE_CONFIRMED: Colors.primary,
	CANCELLED: Colors.danger, //danger
	REJECTED: Colors.danger,
};

export const BookingStatusIconBackgroundColor = {
	PENDING: Colors.warning,
	ACCEPTED: Colors.primaryBg, // success
	CONFIRMED: "rgba(122, 229, 130, 1)",
	RESCHEDULE_CONFIRMED: Colors.primary,
	CANCELLED: Colors.danger, //danger
	REJECTED: Colors.danger,
};

export default BookingStatus;
