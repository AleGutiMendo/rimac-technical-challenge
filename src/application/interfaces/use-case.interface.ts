export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

export interface UseCaseWithoutInput<TOutput> {
  execute(): Promise<TOutput>;
}

export interface UseCaseSync<TInput, TOutput> {
  execute(input: TInput): TOutput;
}

export interface UseCaseWithoutInputSync<TOutput> {
  execute(): TOutput;
}
