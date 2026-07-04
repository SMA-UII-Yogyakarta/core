import { useForm } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthLayout";
import { LoginCard } from "@/Components";

interface LoginProps {
    errors?: Record<string, string>;
}

export default function Login({ errors }: LoginProps) {
    const { data, setData, post, processing, reset } = useForm({
        username: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/login", {
            onSuccess: () => reset("password"),
        });
    };

    const errorMessage = errors?.username ? errors.username : undefined;

    return (
        <AuthLayout title="Login">
            <LoginCard
                onSubmit={handleSubmit}
                loading={processing}
                error={errorMessage}
                data={data}
                setData={setData}
            />
        </AuthLayout>
    );
}
