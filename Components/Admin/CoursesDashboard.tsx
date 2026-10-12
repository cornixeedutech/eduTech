
"use client";

import CreateCoursePage from "@/Components/Admin/CreateCoursePage";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Course {
  _id: string;
  title: string;
  category?: string;
  description?: string;
  image?: string;
}

export default function CoursesDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/courses", {
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", text);
        throw new Error("Failed to fetch courses");
      }

      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching courses ❌");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetchCourses();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      const res = await fetch(`/api/course/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Deleted ✅");

      setCourses((prev) => prev.filter((course) => course._id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Delete failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-16">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
          🎓 Courses Dashboard
        </h1>

        <CreateCoursePage />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-60 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && courses.length === 0 && (
        <p className="mt-10 text-center text-gray-500">
          No courses found 🚫
        </p>
      )}

      {/* GRID */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="group overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
            >
              {/* IMAGE */}
              <div className="h-60 w-full overflow-hidden">
                <img
                  src={course.image || "/placeholder.jpg"}
                  alt={course.title || "Course image"}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <h2 className="line-clamp-1 text-lg font-semibold text-gray-800">
                  {course.title}
                </h2>

                <p className="mb-3 text-sm text-gray-500">
                  {course.category || "Uncategorized"}
                </p>

                <p className="line-clamp-2 text-xs text-gray-400">
                  {course.description || ""}
                </p>

                {/* ACTIONS */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/cornixeAdminTech/courses/${course._id}`}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm text-white hover:bg-blue-700"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(course._id)}
                    className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
