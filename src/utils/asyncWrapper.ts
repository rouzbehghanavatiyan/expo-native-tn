const asyncWrapper = (
  fn: (...args: any[]) => Promise<any>,
  onFinally?: () => void,
) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      onFinally?.();
    }
  };
};

export default asyncWrapper;
