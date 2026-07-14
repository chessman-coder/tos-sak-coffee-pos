import React, { useEffect, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    Clock3,
    Globe,
    ImagePlus,
    Store,
    Save,
    BadgeDollarSign,
} from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import InputError from "@/Components/InputError";

const cronToTime = (cronExpression) => {
    const parts = String(cronExpression || "")
        .trim()
        .split(/\s+/);

    if (parts.length < 2) {
        return "23:59";
    }

    const minute = String(parts[0]).padStart(2, "0");
    const hour = String(parts[1]).padStart(2, "0");

    return `${hour}:${minute}`;
};

const timeToCron = (timeValue) => {
    const [hour = "23", minute = "59"] = String(timeValue || "23:59").split(
        ":",
    );

    return `${String(minute).padStart(2, "0")} ${String(hour).padStart(2, "0")} * * *`;
};

const formatTimeLabel = (timeValue) => {
    const [rawHour = "23", rawMinute = "59"] = String(
        timeValue || "23:59",
    ).split(":");
    const hourNumber = Number(rawHour);
    const minuteNumber = String(rawMinute).padStart(2, "0");
    const period = hourNumber >= 12 ? "PM" : "AM";
    const displayHour = hourNumber % 12 || 12;

    return `${displayHour}:${minuteNumber} ${period}`;
};

export default function Index() {
    const { settings } = usePage().props;
    const initialTime = cronToTime(
        settings?.telegram_daily_report_schedule ?? "59 23 * * *",
    );
    const form = useForm({
        store_name: settings?.store_name ?? "",
        exchange_rate: settings?.exchange_rate ?? 4000,
        telegram_daily_report_time: initialTime,
        logo: null,
    });
    const { data, setData, processing, errors, recentlySuccessful } = form;
    const [logoPreview, setLogoPreview] = useState(
        settings?.logo_url ?? "/images/logo.svg",
    );

    useEffect(() => {
        setLogoPreview(settings?.logo_url ?? "/images/logo.svg");
    }, [settings?.logo_url]);

    const handleSubmit = (event) => {
        event.preventDefault();

        form.transform((payload) => ({
            ...payload,
            telegram_daily_report_schedule: timeToCron(
                payload.telegram_daily_report_time,
            ),
        }));

        form.post(route("settings.update"), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setData("logo", file);
        setLogoPreview(URL.createObjectURL(file));
    };

    return (
        <AdminLayout>
            <Head title="Settings" />

            <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6 lg:px-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-primary-text">
                        Settings
                    </h1>
                    <p className="max-w-2xl text-sm font-medium text-secondary-dark">
                        Update Telegram schedule, currency exchange rate, store
                        branding, and logo from one place.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 rounded-3xl border border-[#eadfda] bg-white p-6 shadow-sm"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-[#f1e8e3] pb-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5a3630] text-white">
                                    <Store size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-primary-text">
                                        Brand & Store
                                    </h2>
                                    <p className="text-xs font-semibold text-secondary-dark">
                                        Store name and logo shown across the
                                        app.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a3630]">
                                        Store Name
                                    </label>
                                    <input
                                        value={data.store_name}
                                        onChange={(e) =>
                                            setData(
                                                "store_name",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-2xl border-0 bg-[#fbf8f6] px-4 py-3 text-sm font-semibold text-[#2f1a16] shadow-inner focus:bg-white focus:ring-2 focus:ring-[#5a3630]"
                                        placeholder="TOS SAK"
                                    />
                                    <InputError message={errors.store_name} />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a3630]">
                                        Logo
                                    </label>
                                    <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#eadfda] bg-[#fcf9f7] px-4 py-5 text-sm font-semibold text-secondary-dark transition hover:border-[#c9b4a8] hover:bg-[#fbf5f2]">
                                        <ImagePlus size={18} />
                                        Upload a new logo
                                        <input
                                            type="file"
                                            accept="image/*,.svg"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                    </label>
                                    <InputError message={errors.logo} />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a3630]">
                                        Exchange Rate
                                    </label>
                                    <div className="relative">
                                        <BadgeDollarSign
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={data.exchange_rate}
                                            onChange={(e) =>
                                                setData(
                                                    "exchange_rate",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border-0 bg-[#fbf8f6] py-3 pl-11 pr-4 text-sm font-semibold text-[#2f1a16] shadow-inner focus:bg-white focus:ring-2 focus:ring-[#5a3630]"
                                            placeholder="4000"
                                        />
                                    </div>
                                    <InputError
                                        message={errors.exchange_rate}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-[#f1e8e3] pb-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4ece9] text-[#5a3630]">
                                    <Clock3 size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-primary-text">
                                        Telegram Schedule
                                    </h2>
                                    <p className="text-xs font-semibold text-secondary-dark">
                                        Cron expression used for the daily
                                        Telegram sales report.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-[#5a3630]">
                                    Daily Report Time
                                </label>
                                <div className="relative">
                                    <Globe
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={18}
                                    />
                                    <input
                                        type="time"
                                        value={data.telegram_daily_report_time}
                                        onChange={(e) =>
                                            setData(
                                                "telegram_daily_report_time",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-2xl border-0 bg-[#fbf8f6] py-3 pl-11 pr-4 text-sm font-semibold text-[#2f1a16] shadow-inner focus:bg-white focus:ring-2 focus:ring-[#5a3630]"
                                    />
                                </div>
                                <p className="text-xs text-secondary-dark">
                                    Example:{" "}
                                    <span className="font-bold">11:59 PM</span>{" "}
                                    sends the report every day at that time.
                                </p>
                                <InputError
                                    message={
                                        errors.telegram_daily_report_schedule
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-[#f1e8e3] pt-5">
                            <div className="text-xs font-semibold text-secondary-dark">
                                {recentlySuccessful
                                    ? "Settings saved."
                                    : "Changes apply immediately after saving."}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#4a2b25] px-5 text-sm font-bold text-white shadow-md transition hover:bg-[#3c221e] disabled:cursor-not-allowed disabled:bg-[#c9b4a8]"
                            >
                                <Save size={16} />
                                Save Settings
                            </button>
                        </div>
                    </form>

                    <div className="space-y-6 rounded-3xl border border-[#eadfda] bg-white p-6 shadow-sm">
                        <div className="space-y-3 text-center">
                            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] border border-[#eadfda] bg-[#fcf9f7] shadow-inner">
                                <img
                                    src={logoPreview}
                                    alt="Store logo preview"
                                    className="h-20 w-20 object-contain"
                                />
                            </div>
                            <h3 className="text-xl font-black text-primary-text">
                                {data.store_name || "Store Preview"}
                            </h3>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-[#fcf9f7] p-4">
                                <div className="text-[10px] font-black uppercase tracking-wider text-secondary-dark">
                                    Exchange Rate
                                </div>
                                <div className="mt-2 text-2xl font-black text-[#5a3630]">
                                    {Number(
                                        data.exchange_rate || 0,
                                    ).toLocaleString()}
                                </div>
                                <div className="text-xs font-semibold text-secondary-dark">
                                    KHR per USD
                                </div>
                            </div>
                            <div className="rounded-2xl bg-[#fcf9f7] p-4">
                                <div className="text-[10px] font-black uppercase tracking-wider text-secondary-dark">
                                    Telegram
                                </div>
                                <div className="mt-2 mb-1 text-sm font-bold text-[#2f1a16]">
                                    Daily report scheduler
                                </div>
                                <div className="text-sm tracking-widest font-bold text-secondary-dark">
                                    {formatTimeLabel(
                                        data.telegram_daily_report_time,
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
