export class BaseResponseDto<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;

  constructor(success: boolean, data?: T, error?: string, message?: string) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string): BaseResponseDto<T> {
    return new BaseResponseDto(true, data, undefined, message);
  }

  static error<T>(
    error: string,
    message?: string,
  ): BaseResponseDto<T | undefined> {
    return new BaseResponseDto(false, undefined, error, message);
  }
}
