/**
 * Utility class to limit concurrent execution of async operations
 * Useful for rate limiting API calls or controlling resource usage
 */
export class ConcurrencyLimiter {
  /**
   * Execute promises with a maximum concurrency limit
   * @param tasks Array of functions that return promises
   * @param maxConcurrency Maximum number of concurrent operations (default: 3)
   * @returns Promise that resolves to array of results in the same order as input
   */
  static async limitConcurrency<T>(
    tasks: (() => Promise<T>)[],
    maxConcurrency: number = 3
  ): Promise<T[]> {
    if (tasks.length === 0) {
      return [];
    }

    if (maxConcurrency <= 0) {
      throw new Error("maxConcurrency must be greater than 0");
    }

    // If we have fewer tasks than the limit, just run them all
    if (tasks.length <= maxConcurrency) {
      return Promise.all(tasks.map(task => task()));
    }

    const results: T[] = new Array(tasks.length);
    let currentIndex = 0;

    const executeNext = async (workerIndex: number): Promise<void> => {
      while (currentIndex < tasks.length) {
        const taskIndex = currentIndex++;
        const task = tasks[taskIndex];
        
        try {
          results[taskIndex] = await task();
        } catch (error) {
          // Re-throw the error to maintain existing error handling behavior
          throw error;
        }
      }
    };

    // Create worker promises
    const workers = Array(Math.min(maxConcurrency, tasks.length))
      .fill(0)
      .map((_, i) => executeNext(i));

    await Promise.all(workers);
    return results;
  }

  /**
   * Execute promises in batches with a maximum concurrency limit
   * Similar to limitConcurrency but with explicit batching for better control
   * @param tasks Array of functions that return promises
   * @param batchSize Size of each batch (default: 3)
   * @returns Promise that resolves to array of results in the same order as input
   */
  static async executeBatches<T>(
    tasks: (() => Promise<T>)[],
    batchSize: number = 3
  ): Promise<T[]> {
    if (tasks.length === 0) {
      return [];
    }

    if (batchSize <= 0) {
      throw new Error("batchSize must be greater than 0");
    }

    const results: T[] = [];
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(task => task().catch(error => error as T))
      );
      results.push(...batchResults);
    }

    return results;
  }
}