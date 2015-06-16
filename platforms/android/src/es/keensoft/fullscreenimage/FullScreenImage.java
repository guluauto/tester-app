//
//  FullScreenImage.java
//  Copyright (c) 2014 keensoft - http://keensoft.es
//

package es.keensoft.fullscreenimage;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;

import android.annotation.SuppressLint;

import netscape.javascript.JSException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;


import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.util.Base64;
import android.*;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.webkit.MimeTypeMap;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;


@SuppressLint("DefaultLocale")
public class FullScreenImage extends CordovaPlugin {
    public CallbackContext command;
    public JSONArray args;

    private static final String LOG_TAG = "FullScreenImage";
    private static final String[] actions = { "showImageURL", "showImageBase64" };
    /**
     * Executes the request.
     * <p/>
     * This method is called from the WebView thread.
     * To do a non-trivial amount of work, use:
     * cordova.getThreadPool().execute(runnable);
     * <p/>
     * To run on the UI thread, use:
     * cordova.getActivity().runOnUiThread(runnable);
     *
     * @param action   The action to execute.
     * @param args     The exec() arguments in JSON form.
     * @param callback The callback context used when calling
     *                 back into JavaScript.
     * @return Whether the action was valid.
     */
    @Override
    public boolean execute(String action, JSONArray args,
                           final CallbackContext callback) throws JSONException {
        this.command = callback;
        this.args = args;

        if (Arrays.asList(actions).indexOf(action) != -1) {
            cordova.getThreadPool().execute(new ShowHandler(this, action));
            return true;
        }

        // Returning false results in a "MethodNotFound" error.
        return false;
    }

    private class ShowHandler implements Runnable {
        private final FullScreenImage fsi;
        private final String action;

        ShowHandler(FullScreenImage fsi, String action) {
            this.fsi = fsi;
            this.action = action;
        }

        @Override
        public void run() {
            try {
                if ("showImageURL".equals(action)) {
                    this.fsi.showImageURL(this.fsi.args);
                } else if ("showImageBase64".equals(action)){
                    this.fsi.showImageBase64(this.fsi.args);
                } else {
                    this.fsi.command.error("MethodNotFound");
                }

                this.fsi.command.success();
            } catch (JSONException e) {
                LOG.d(LOG_TAG, "Show image json exception");
            }
        }
    }

    private String getJSONProperty(JSONObject json, String property) throws JSONException {
        if (json.has(property)) {
            return json.getString(property);
        }
        return null;
    }

    private String getTempDirectoryPath() {
        File cache = null;

        // SD Card Mounted
        if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
            cache = new File(Environment.getExternalStorageDirectory().getAbsolutePath() +
                    "/Android/data/" + cordova.getActivity().getPackageName() + "/cache/");
        }
        // Use internal storage
        else {
            cache = cordova.getActivity().getCacheDir();
        }

        // Create the cache directory if it doesn't exist
        cache.mkdirs();
        return cache.getAbsolutePath();
    }

    /**
     * Show image in full screen from local resources.
     *
     * @param url File path in local system
     */
    public void showImageURL(JSONArray args) throws JSONException {
        JSONObject json = args.getJSONObject(0);
        String url = getJSONProperty(json, "url");
        String extension = MimeTypeMap.getFileExtensionFromUrl(url);

        InputStream fis = null;
        OutputStream fos = null;

        LOG.d(LOG_TAG, "In showImageURL function: " + url + ", extension: " + extension);

        try {
            File f = new File(getTempDirectoryPath(), "output." + extension);
            f.createNewFile();
            fos = new FileOutputStream(f);
            fis = new FileInputStream(FileHelper.stripFileProtocol(url));

            LOG.d(LOG_TAG, "Created fos and fis");

            byte buf[] = new byte[1024];
            int len;

            while ((len = fis.read(buf)) > 0) {
                fos.write(buf, 0, len);
            }

            fos.close();
            fis.close();

            Uri imageUrl = Uri.fromFile(f);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setDataAndType(imageUrl, MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension));
            cordova.getActivity().startActivity(intent);
        } catch (IOException e) {
            LOG.d(LOG_TAG, "FullScreenImagePlugin", "Could not create file: " + e.toString());
        }
    }


    /**
     * Show image in full screen from base64 String.
     *
     * @param base64 Image base64 String
     * @param name   image Name to show on intent view
     */
    public void showImageBase64(JSONArray args) throws JSONException {
        LOG.d(LOG_TAG, "===== call showImageURL");

        JSONObject json = args.getJSONObject(0);

        String base64Image = getJSONProperty(json, "base64");
        String name = getJSONProperty(json, "name");
        String extension = getJSONProperty(json, "type");
        File pPath = Environment.getExternalStorageDirectory();
        if (!pPath.exists()) {
            boolean bReturn = pPath.mkdirs();
        }

        try {

            byte[] imageAsBytes = Base64.decode(base64Image, Base64.DEFAULT);

            File filePath = new File(pPath, "output." + extension);
            filePath.createNewFile();

            FileOutputStream os = new FileOutputStream(filePath, false);
            os.write(imageAsBytes);
            os.flush();
            os.close();

            Uri path = Uri.fromFile(filePath);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setDataAndType(path, "image/*");
            this.cordova.getActivity().startActivity(intent);

        } catch (IOException e) {
            Log.d("FullScreenImagePlugin", "Could not create file: " + e.toString());
        }
    }
}
