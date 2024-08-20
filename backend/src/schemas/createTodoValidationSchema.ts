export const createTodoValidationSchema = {
    task: {
        notEmpty: {
            errorMessage: "Task cannot be empty"
        },
        isString: {
            errorMessage: "Task must be a string"
        }
    }
}