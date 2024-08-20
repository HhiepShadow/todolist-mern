export const getTodoByIDValidationSchema = {
  id: {
    isMongoId: {
      errorMessage: "Invalid ID",
    },
  },
};
