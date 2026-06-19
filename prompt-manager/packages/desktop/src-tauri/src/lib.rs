use tauri::Manager;

/// Initialize and run the Tauri application
///
/// Registers all plugins:
/// - tauri-plugin-sql: SQLite database access for prompt storage
/// - tauri-plugin-fs: File system operations for import/export
/// - tauri-plugin-dialog: Native file dialogs
/// - tauri-plugin-global-shortcut: System-wide keyboard shortcuts
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // SQLite database plugin — stores prompts, scenes, versions
        .plugin(tauri_plugin_sql::Builder::new().build())
        // File system access for JSON export/import
        .plugin(tauri_plugin_fs::init())
        // Native OS file dialogs (open/save)
        .plugin(tauri_plugin_dialog::init())
        // Global keyboard shortcuts
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Log app data directory for debugging
            let app_data_dir = app.path().app_data_dir().unwrap_or_default();
            println!("App data directory: {:?}", app_data_dir);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
