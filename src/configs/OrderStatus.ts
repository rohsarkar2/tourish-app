import Colors from "./Colors";

const OrderStatus = {
	PENDING: "pending", // warning
	PLACED: "placed", // primaryBg
	COMPLETED: "completed", //success
	RESCHEDULED: "rescheduled", // primary
	CANCELLED: "cancelled", // danger
};

export const OrderStatusBackgroundColor = {
	PENDING: "rgba(235, 179, 12, 0.2)",
	PLACED: "rgba(21, 189, 216, 0.2)", // success
	COMPLETED: "rgba(122, 229, 130, 0.2)",
	RESCHEDULED: "rgba(60, 156, 225, 0.2)",
	CANCELLED: "rgba(220, 53, 69, 0.2)", //danger
};

export const OrderStatusBorderColor = {
	PENDING: Colors.warning,
	PLACED: Colors.primaryBg, // success
	COMPLETED: "rgba(122, 229, 130, 1)",
	RESCHEDULED: Colors.primary,
	CANCELLED: Colors.danger, //danger
};
export const OrderStatusIconBackgroundColor = {
	PENDING: Colors.warning,
	PLACED: Colors.primaryBg, // success
	COMPLETED: "rgba(122, 229, 130, 1)",
	RESCHEDULED: Colors.primary,
	CANCELLED: Colors.danger, //danger
};

export default OrderStatus;
