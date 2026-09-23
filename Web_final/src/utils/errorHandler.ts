import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    error_code?: string;
    status_code?: string;
    api_endpoint?: string;
}


export const handleApiError = (error: AxiosError<ApiErrorResponse>, router?: ReturnType<typeof useRouter>) => {
    if (!error.response) {
        toast.error('لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت', {
            duration: 5000,
            icon: '🌐'
        });
        return;
    }

    const { status, data } = error.response;

    switch (status) {
        case 401:
            handleUnauthenticated(router);
            break;

        case 403:
            handleForbidden(data);
            break;

        case 404:
            handleNotFound(data, router);
            break;

        case 422:
            handleValidationErrors(data);
            break;

        case 500:
            handleServerError(data);
            break;

        default:
            handleGenericError(data, status);
    }
};


const handleUnauthenticated = (router?: ReturnType<typeof useRouter>) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    toast.error('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى', {
        duration: 4000,
        icon: '🔒'
    });

    if (router && typeof window !== 'undefined') {
        setTimeout(() => {
            router.push('/auth/login');
        }, 1500);
    }
};


const handleForbidden = (data: ApiErrorResponse) => {
    if (data.status_code === 'CANNOT_DELETE_PROCESSING') {
        toast.error('لا يمكن حذف الشكوى أثناء المعالجة. يرجى التواصل مع الدعم الفني', {
            duration: 6000,
            icon: '⚠️'
        });
    } else {
        toast.error(data.message || 'ليس لديك صلاحية لهذا الإجراء', {
            duration: 5000,
            icon: '🚫'
        });
    }
};


const handleNotFound = (data: ApiErrorResponse, router?: ReturnType<typeof useRouter>) => {
    toast.error(data.message || 'المورد المطلوب غير موجود', {
        duration: 4000,
        icon: '🔍'
    });

    if (router && typeof window !== 'undefined') {
        setTimeout(() => {
            router.back();
        }, 2000);
    }
};


const handleValidationErrors = (data: ApiErrorResponse) => {
    if (!data.errors) {
        toast.error(data.message || 'يرجى التحقق من البيانات المدخلة', {
            duration: 5000
        });
        return;
    }

    const errorMessages: string[] = [];

    Object.keys(data.errors).forEach(field => {
        const fieldErrors = Array.isArray(data.errors![field])
            ? data.errors![field]
            : [data.errors![field]];
        fieldErrors.forEach(msg => {
            errorMessages.push(msg);
        });
    });

    toast.error(errorMessages.join('\n') || data.message, {
        duration: 8000,
        style: {
            maxWidth: '500px',
            whiteSpace: 'pre-line'
        },
        icon: '❌'
    });
};


const handleServerError = (data: ApiErrorResponse) => {
    toast.error(data.message || 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً', {
        duration: 6000,
        icon: '🔥'
    });

    if (process.env.NODE_ENV === 'development') {
        console.error('Server Error Details:', data);
    }
};


const handleGenericError = (data: ApiErrorResponse, status: number) => {
    toast.error(data.message || `حدث خطأ غير متوقع (${status})`, {
        duration: 5000,
        icon: '⚠️'
    });
};


export const getErrorMessage = (error: AxiosError<ApiErrorResponse>): string => {
    if (!error.response) {
        return 'لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت';
    }

    const { status, data } = error.response;

    if (data.message) {
        return data.message;
    }

    switch (status) {
        case 401:
            return 'غير مصرح - يرجى تسجيل الدخول';
        case 403:
            if (data.status_code === 'CANNOT_DELETE_PROCESSING') {
                return 'لا يمكن حذف الشكوى أثناء المعالجة';
            }
            return 'ليس لديك صلاحية لهذا الإجراء';
        case 404:
            return 'المورد المطلوب غير موجود';
        case 422:
            return 'يرجى التحقق من البيانات المدخلة';
        case 500:
            return 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً';
        default:
            return `حدث خطأ غير متوقع (${status})`;
    }
};


export const getValidationErrors = (error: AxiosError<ApiErrorResponse>): Map<string, string[]> => {
    const errorsMap: Map<string, string[]> = new Map();
    if (error.response && error.response.status === 422 && error.response.data && error.response.data.errors) {
        const errorFields = error.response.data.errors;
        Object.keys(errorFields).forEach(field => {
            const fieldValue = errorFields[field];
            const fieldErrors = Array.isArray(fieldValue)
                ? fieldValue
                : [fieldValue];
            errorsMap.set(field, fieldErrors);
        });
    }

    return errorsMap;
};


export const isApiError = (error: any): error is AxiosError<ApiErrorResponse> => {
    return error && error.isAxiosError && error.response;
};


export const isErrorType = (error: AxiosError<ApiErrorResponse>, status: number): boolean => {
    return error.response?.status === status;
};
