# PR Change Notes

**Title:**
Patched Profile Settings – Enhanced Avatar Upload Experience

**Summary:**
This PR improves the avatar upload functionality in the user profile settings page. It enhances the `UploadImage` component by adding a dedicated `settings` variant that provides a richer, more user-friendly interface with preview, remove option, upload/cancel controls, and better error handling. The `ProfileSettings` page was refactored to use this new variant, removing duplicated avatar rendering logic. The changes make avatar management more intuitive, consistent, and visually polished while improving code maintainability.

## 1. Concepts

The main changes introduce **component variant pattern** and **unified file upload UI**.

Core ideas:

- `UploadImage` component now accepts a `variant` prop (`"default"` or `"settings"`) to render different UIs depending on context.
- Real-time image preview with remove (X) button.
- Proper file input reset and state management using `resetFile` from the `useFile` hook.
- Cleaner separation of concerns: `ProfileSettings` delegates avatar upload entirely to `UploadImage`.
- Improved accessibility with dynamic alt text, better fallbacks, and loading states.

## 2. Real-world analogy

Think of the old profile settings like a simple mailbox where you could only drop a letter in — no preview, no way to take it back easily.

The new version is like upgrading to a smart parcel locker: you can see exactly what you're sending (preview), remove it if you change your mind, get clear feedback while it's processing, and the interface adjusts nicely for the task. Everything feels more controlled and user-friendly.

## 3. Smallest practical example

**Using the enhanced UploadImage component:**

```jsx
// In ProfileSettings.jsx
<div className="rounded-2xl border border-gray-100 bg-[#FCFCFD] p-5">
  <UploadImage variant="settings" />
</div>
```

**Inside UploadImage.jsx (settings variant snippet):**

```jsx
if (variant === "settings") {
  return (
    <>
      {error && <ErrorAlert error={error} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <Avatar
            src={previewSource}
            name={displayName}
            alt={`${displayName} avatar`}
            size={112}
          />
          {selectedFile && (
            <button
              onClick={clearSelection}
              className="absolute right-1 top-1 ..."
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div>
          <input type="file" ref={fileRef} onChange={handleFileChange} />
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Uploading..." : "Upload image"}
          </button>
          <button type="button" onClick={clearSelection}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
```

## 4. Why it exists & where it is used

The previous implementation had a basic avatar display in `ProfileSettings` and a limited `UploadImage` component, leading to duplicated code and a less polished upload experience (no easy way to preview or cancel, poor feedback).

This patch solves:

- Poor user experience when changing profile pictures.
- Code duplication between avatar display and upload logic.
- Inconsistent styling and behavior.

It is used specifically in the **Profile Settings** page (`/settings` or similar route) for authenticated users who want to update their avatar. The `default` variant likely remains available for other contexts like registration or quick uploads.

## 5. Technical trade-off

One significant trade-off was making `UploadImage` more complex by adding conditional rendering and a `variant` prop instead of creating a completely separate component for settings.

This approach was chosen because it promotes **reusability** and avoids duplicating file handling, preview logic, mutation handling, and error management. It keeps related upload functionality in one place.

The introduced technical debt is a slightly larger component with conditional logic, which could become harder to maintain if more variants are added in the future. A potential future improvement would be to extract the settings-specific UI into a sub-component or use composition.

## PR Information

- **Frontend/UI**:
  - Enhanced `UploadImage.jsx` with `variant` support and full settings-mode UI (preview, remove button, upload controls, loading state)
  - Refactored `ProfileSettings.jsx` to use the new `UploadImage variant="settings"` and removed redundant avatar + camera icon code
  - Improved layout (simplified grid, added styled container)
  - Better accessibility and UX (dynamic alt text, file reset, error display)

- **No backend changes, no new dependencies.**

This is a focused UI/UX improvement for a better profile management experience.

```

```
