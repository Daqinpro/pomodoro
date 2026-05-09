use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[tauri::command]
fn toggle_always_on_top(window: tauri::Window) -> Result<bool, String> {
    let is_top = window.is_always_on_top().unwrap_or(false);
    window
        .set_always_on_top(!is_top)
        .map_err(|e| e.to_string())?;
    Ok(!is_top)
}

#[tauri::command]
fn get_always_on_top(window: tauri::Window) -> bool {
    window.is_always_on_top().unwrap_or(false)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // System tray menu
            let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let pin_item = MenuItem::with_id(app, "pin", "始终置顶", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &pin_item, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Pomodoro")
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "pin" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let is_top = window.is_always_on_top().unwrap_or(false);
                            let _ = window.set_always_on_top(!is_top);
                            let label = if !is_top { "取消置顶" } else { "始终置顶" };
                            let _ = pin_item.set_text(label);
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_always_on_top,
            get_always_on_top
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
