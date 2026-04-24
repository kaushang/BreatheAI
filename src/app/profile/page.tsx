"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { INDIAN_CITIES, findCityByName } from "@/constants/cities";
import { auth, db } from "@/lib/firebase/client";
import {
  AlertTriangle,
  Heart,
  Loader2,
  MapPin,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

const HEALTH_CONDITIONS = [
  { id: "none", label: "None" },
  { id: "asthma", label: "Asthma" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "elderly", label: "Elderly (60+)" },
  { id: "pregnant", label: "Pregnant" },
  { id: "child_under_12", label: "Child (under 12)" },
] as const;

interface UserProfileData {
  uid: string;
  full_name?: string;
  email?: string;
  age?: number;
  city?: string;
  area?: string;
  lat?: number;
  lng?: number;
  health_conditions?: string[];
  aqi_alert_threshold?: number;
}

export default function ProfilePage() {
  const router = useRouter();

  const [profileDoc, setProfileDoc] = useState<UserProfileData | null>(null);
  const [authUid, setAuthUid] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [conditions, setConditions] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [personalSaving, setPersonalSaving] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);
  const [conditionsSaving, setConditionsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const initialPersonal = useRef({ fullName: "", email: "" });
  const initialLocation = useRef({ city: "", area: "", lat: 0, lng: 0 });
  const initialConditions = useRef<string[]>([]);

  const trimmedFullName = fullName.trim();
  const selectedCity = city || cityQuery.trim();
  const normalizedArea = area.trim() || selectedCity;
  const selectedConditions = conditions.filter((c) => c !== "none");

  const isPersonalDirty = trimmedFullName !== initialPersonal.current.fullName.trim();
  const isLocationDirty =
    selectedCity !== initialLocation.current.city ||
    normalizedArea !== initialLocation.current.area;
  const isConditionsDirty = (() => {
    const current = [...selectedConditions].sort();
    const initial = [...initialConditions.current].sort();
    return (
      current.length !== initial.length ||
      current.some((value, index) => value !== initial[index])
    );
  })();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target as Node)
      ) {
        setCityDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        setPageLoading(true);
        setAuthUid(user.uid);

        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        const data = profileSnap.exists()
          ? (profileSnap.data() as UserProfileData)
          : null;

        setProfileDoc(data);
        setFullName(data?.full_name || user.displayName || "");
        setEmail(data?.email || user.email || "");
        setCity(data?.city || "");
        setArea(data?.area || "");
        setCityQuery(data?.city || "");
        setConditions(data?.health_conditions?.length ? data.health_conditions : []);

        initialPersonal.current = {
          fullName: data?.full_name || user.displayName || "",
          email: data?.email || user.email || "",
        };
        initialLocation.current = {
          city: data?.city || "",
          area: data?.area || "",
          lat: data?.lat || 0,
          lng: data?.lng || 0,
        };
        initialConditions.current = data?.health_conditions?.length
          ? data.health_conditions
          : [];
      } catch (err) {
        console.error("[Profile] Error fetching profile:", err);
        setMessageType("error");
        setMessage("Failed to load your profile. Please refresh and try again.");
      } finally {
        setPageLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return INDIAN_CITIES;
    const q = cityQuery.toLowerCase();
    return INDIAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q),
    );
  }, [cityQuery]);

  function showMessage(nextMessage: string, type: "success" | "error") {
    setMessageType(type);
    setMessage(nextMessage);
  }

  function selectCity(name: string) {
    setCity(name);
    setCityQuery(name);
    setCityDropdownOpen(false);
  }

  function toggleCondition(id: string) {
    setConditions((prev) => {
      if (id === "none") {
        return prev.includes("none") ? [] : ["none"];
      }

      const withoutNone = prev.filter((c) => c !== "none");
      if (withoutNone.includes(id)) {
        return withoutNone.filter((c) => c !== id);
      }

      return [...withoutNone, id];
    });
  }

  async function persistProfile(partial: Partial<UserProfileData>) {
    if (!authUid) {
      throw new Error("User session not found.");
    }

    const basePayload = {
      uid: authUid,
      email,
      full_name: fullName.trim(),
      city,
      area: area.trim(),
      health_conditions: conditions.filter((c) => c !== "none"),
      updated_at: serverTimestamp(),
      ...partial,
    };

    await setDoc(
      doc(db, "users", authUid),
      profileDoc
        ? basePayload
        : {
            ...basePayload,
            created_at: new Date().toISOString(),
          },
      { merge: true },
    );
  }

  async function handleSavePersonal() {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      showMessage("Full name is required.", "error");
      return;
    }

    try {
      setPersonalSaving(true);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmedName });
      }

      await persistProfile({ full_name: trimmedName, email });
      setProfileDoc((prev) => ({ ...(prev ?? { uid: authUid }), full_name: trimmedName, email }));
      initialPersonal.current.fullName = trimmedName;
      showMessage("Personal information updated.", "success");
    } catch (err) {
      console.error("[Profile] Failed to save personal info:", err);
      showMessage("Failed to save personal information.", "error");
    } finally {
      setPersonalSaving(false);
    }
  }

  async function handleSaveLocation() {
    const selectedCity = city || cityQuery.trim();
    if (!selectedCity) {
      showMessage("Please select your city.", "error");
      return;
    }

    const cityData = findCityByName(selectedCity);
    if (!cityData) {
      showMessage("Please choose a city from the list.", "error");
      return;
    }

    const nextArea = area.trim() || cityData.name;

    try {
      setLocationSaving(true);
      await persistProfile({
        city: cityData.name,
        area: nextArea,
        lat: cityData.latitude,
        lng: cityData.longitude,
      });

      setCity(cityData.name);
      setCityQuery(cityData.name);
      setArea(nextArea);
      setProfileDoc((prev) => ({
        ...(prev ?? { uid: authUid }),
        city: cityData.name,
        area: nextArea,
        lat: cityData.latitude,
        lng: cityData.longitude,
      }));
      initialLocation.current = {
        city: cityData.name,
        area: nextArea,
        lat: cityData.latitude,
        lng: cityData.longitude,
      };
      showMessage("Location updated.", "success");
    } catch (err) {
      console.error("[Profile] Failed to save location:", err);
      showMessage("Failed to save location.", "error");
    } finally {
      setLocationSaving(false);
    }
  }

  async function handleSaveConditions() {
    try {
      setConditionsSaving(true);
      const nextConditions = conditions.filter((c) => c !== "none");
      await persistProfile({ health_conditions: nextConditions });
      setProfileDoc((prev) => ({
        ...(prev ?? { uid: authUid }),
        health_conditions: nextConditions,
      }));
      initialConditions.current = nextConditions;
      showMessage("Health conditions updated.", "success");
    } catch (err) {
      console.error("[Profile] Failed to save conditions:", err);
      showMessage("Failed to save health conditions.", "error");
    } finally {
      setConditionsSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <header id="profile-header" className="mb-8">
        <div className="mb-1 flex items-center gap-2.5">
          <User className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Your Profile
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your personal settings and health information
        </p>
      </header>

      {message && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {message}
        </div>
      )}

      {pageLoading ? (
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your profile...
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div
              id="personal-info-card"
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Personal Information
              </h3>

              <div className="mb-6 space-y-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-input bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground outline-none"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground/50">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <button
                id="save-personal-btn"
                type="button"
                onClick={handleSavePersonal}
                disabled={!isPersonalDirty || personalSaving}
                className="w-full rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {personalSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div
              id="location-card"
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Your Location
              </h3>

              <div className="mb-4 space-y-4">
                <div ref={cityDropdownRef} className="relative">
                  <label
                    htmlFor="profile-city"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    City
                  </label>
                  <div className="relative">
                    <input
                      id="profile-city"
                      type="text"
                      value={cityQuery}
                      onChange={(e) => {
                        setCityQuery(e.target.value);
                        setCity("");
                        setCityDropdownOpen(true);
                      }}
                      onFocus={() => setCityDropdownOpen(true)}
                      placeholder="Search for your city..."
                      autoComplete="off"
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  {cityDropdownOpen && (
                    <div className="absolute z-50 mt-1 max-h-[200px] w-full overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
                      {filteredCities.length === 0 ? (
                        <div className="px-3.5 py-3 text-sm text-muted-foreground">
                          No cities found
                        </div>
                      ) : (
                        filteredCities.map((c) => (
                          <button
                            key={`${c.name}-${c.state}`}
                            type="button"
                            onClick={() => selectCity(c.name)}
                            className={`w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                              city === c.name
                                ? "bg-muted font-medium text-foreground"
                                : "text-foreground"
                            }`}
                          >
                            <span>{c.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {c.state}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="profile-area"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Area / Locality
                  </label>
                  <input
                    id="profile-area"
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Anand Vihar, Connaught Place"
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <p className="mb-4 text-[10px] text-muted-foreground/50">
                Your AQI data is based on this location
              </p>

              <button
                id="update-location-btn"
                type="button"
                onClick={handleSaveLocation}
                disabled={!isLocationDirty || locationSaving}
                className="w-full rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {locationSaving ? "Saving..." : "Update Location"}
              </button>
            </div>
          </div>

          <section id="section-health" className="mb-8">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                Your Health Conditions
              </h3>

              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {HEALTH_CONDITIONS.map(({ id, label }) => {
                  const isSelected = conditions.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleCondition(id)}
                      className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5 font-medium text-foreground"
                          : "border-input bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mb-4 text-xs text-muted-foreground/50">
                This helps us personalize health advice for you
              </p>

              <button
                id="save-conditions-btn"
                type="button"
                onClick={handleSaveConditions}
                disabled={!isConditionsDirty || conditionsSaving}
                className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {conditionsSaving ? "Saving..." : "Save Conditions"}
              </button>
            </div>
          </section>

          <section id="section-danger-zone" className="mb-8">
            <div className="rounded-2xl border border-destructive/30 bg-card p-6">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </h3>
              <p className="mb-5 text-xs text-muted-foreground">
                Irreversible and destructive actions
              </p>

              <button
                id="delete-account-btn"
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="rounded-xl border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive transition-all duration-200 hover:border-destructive/60 hover:bg-destructive/5 active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Account
                </span>
              </button>
            </div>
          </section>
        </>
      )}

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteDialogOpen(false)}
          />

          <div className="animate-in fade-in zoom-in-95 relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl duration-200">
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Delete Account
              </h3>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Are you sure? This will permanently delete your account and all
              your data. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("Account deleted (mock)");
                  setDeleteDialogOpen(false);
                }}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-all duration-200 hover:bg-destructive/90 active:scale-[0.98]"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-4 text-center text-[10px] text-muted-foreground/40">
        Your signed-in profile is now loaded from Firebase and saved back to
        your account.
      </div>
    </DashboardLayout>
  );
}
