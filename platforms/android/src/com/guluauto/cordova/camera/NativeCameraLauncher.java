package com.guluauto.cordova.camera;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.util.Calendar;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.util.Base64;
import android.util.Log;

import com.guluauto.cordova.camera.FileHelper;
import com.guluauto.cordova.camera.ExifHelper;

/**
 * This class launches the camera view, allows the user to take a picture,
 * closes the camera view, and returns the captured image. When the camera view
 * is closed, the screen displayed before the camera view was shown is
 * redisplayed.
 */
public class NativeCameraLauncher extends CordovaPlugin {

    private static final String LOG_TAG = "NativeCameraLauncher";
    private static final String _DATA = "_data";

    private static final int DATA_URL = 0;              // Return base64 encoded string
    private static final int FILE_URI = 1;              // Return file uri (content://media/external/images/media/2 for Android)
    private static final int NATIVE_URI = 2;                    // On Android, this is the same as FILE_URI

    private static final int PHOTOLIBRARY = 0;          // Choose image from picture library (same as SAVEDPHOTOALBUM for Android)
    private static final int CAMERA = 1;                // Take picture from camera
    private static final int SAVEDPHOTOALBUM = 2;       // Choose image from picture library (same as PHOTOLIBRARY for Android)

    private static final int JPEG = 0;                  // Take a picture of type JPEG
    private static final int PNG = 1;                   // Take a picture of type PNG

    private static final int PICTURE = 0;               // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
    private static final int VIDEO = 1;                 // allow selection of video only, ONLY RETURNS URL
    private static final int ALLMEDIA = 2;              // allow selection from all media types

    private static final String GET_PICTURE = "Get Picture";
    private static final String GET_VIDEO = "Get Video";
    private static final String GET_All = "Get All";

    private int mQuality;
    private int targetWidth;
    private int targetHeight;
    private Uri imageUri;
    private File photo;
    private int encodingType;                           // Type of encoding to use
    private int mediaType;                              // What type of media to retrieve
    private boolean allowEdit;                          // Should we allow the user to crop the image.
    private boolean saveToPhotoAlbum;
    private int destType;
    private CallbackContext callbackContext;
    private String date = null;

    private Uri croppedUri;

    public NativeCameraLauncher() {
    }

    void failPicture(String reason) {
        Log.e(LOG_TAG, reason);
        callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, reason));
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        PluginResult.Status status = PluginResult.Status.OK;
        String result = "";
        this.callbackContext = callbackContext;
        try {
            if (action.equals("takePicture")) {
                int srcType = CAMERA;

                this.destType = FILE_URI;
                this.targetHeight = 0;
                this.targetWidth = 0;
                this.encodingType = JPEG;
                this.mediaType = PICTURE;
                this.mQuality = 80;
                this.saveToPhotoAlbum = false;

                srcType = args.getInt(2);

                this.destType = args.getInt(1);
                this.mQuality = args.getInt(0);
                this.targetWidth = args.getInt(3);
                this.targetHeight = args.getInt(4);
                this.encodingType = args.getInt(5);
                this.mediaType = args.getInt(6);
                this.allowEdit = args.getBoolean(7);

                // If the user specifies a 0 or smaller width/height
                // make it -1 so later comparisons succeed
                if (this.targetWidth < 1) {
                    this.targetWidth = -1;
                }
                if (this.targetHeight < 1) {
                    this.targetHeight = -1;
                }

                try {
                    Log.d(LOG_TAG, "===== srcType: " + srcType + ", equal camera ??: " + CAMERA);
                    if (srcType == CAMERA) {
                        this.takePicture();
                    } else if ((srcType == PHOTOLIBRARY) || (srcType == SAVEDPHOTOALBUM)) {
                        this.getImage(srcType, this.destType, encodingType);
                    }
                } catch (IllegalArgumentException e) {
                    callbackContext.error("Illegal Argument Exception");
                    PluginResult r = new PluginResult(PluginResult.Status.ERROR);
                    callbackContext.sendPluginResult(r);
                    return true;
                }

                PluginResult r = new PluginResult(PluginResult.Status.NO_RESULT);
                r.setKeepCallback(true);
                callbackContext.sendPluginResult(r);
                return true;
            }
            return false;
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
            return true;
        }
    }

    /**
     * Get image from photo library.
     *
     * @param quality      Compression quality hint (0-100: 0=low quality & high compression, 100=compress of max quality)
     * @param srcType      The album to get image from.
     * @param returnType   Set the type of image to return.
     * @param encodingType
     */
    // TODO: Images selected from SDCARD don't display correctly, but from CAMERA ALBUM do!
    // TODO: Images from kitkat filechooser not going into crop function
    public void getImage(int srcType, int returnType, int encodingType) {
        Intent intent = new Intent();
        String title = GET_PICTURE;
        croppedUri = null;
        if (this.mediaType == PICTURE) {
            intent.setType("image/*");
            if (this.allowEdit) {
                intent.setAction(Intent.ACTION_PICK);
                intent.putExtra("crop", "true");
                if (targetWidth > 0) {
                    intent.putExtra("outputX", targetWidth);
                }
                if (targetHeight > 0) {
                    intent.putExtra("outputY", targetHeight);
                }
                if (targetHeight > 0 && targetWidth > 0 && targetWidth == targetHeight) {
                    intent.putExtra("aspectX", 1);
                    intent.putExtra("aspectY", 1);
                }
                File photo = createCaptureFile();
                croppedUri = Uri.fromFile(photo);
                intent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, croppedUri);
            } else {
                intent.setAction(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
            }
        } else if (this.mediaType == VIDEO) {
            intent.setType("video/*");
            title = GET_VIDEO;
            intent.setAction(Intent.ACTION_GET_CONTENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
        } else if (this.mediaType == ALLMEDIA) {
            // I wanted to make the type 'image/*, video/*' but this does not work on all versions
            // of android so I had to go with the wildcard search.
            intent.setType("*/*");
            title = GET_All;
            intent.setAction(Intent.ACTION_GET_CONTENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
        }
        if (this.cordova != null) {
            this.cordova.startActivityForResult((CordovaPlugin) this, intent, 2);
        }
    }

    public void takePicture() {
        // Save the number of images currently on disk for later
        Intent intent = new Intent(this.cordova.getActivity().getApplicationContext(), CameraActivity.class);
        this.photo = createCaptureFile();
        this.imageUri = Uri.fromFile(photo);
        intent.putExtra(MediaStore.EXTRA_OUTPUT, this.imageUri);

        this.cordova.startActivityForResult((CordovaPlugin) this, intent, 1);
    }

    private File createCaptureFile() {
        Calendar c = Calendar.getInstance();
        this.date = "" + c.get(Calendar.DAY_OF_MONTH)
                + c.get(Calendar.MONTH)
                + c.get(Calendar.YEAR)
                + c.get(Calendar.HOUR_OF_DAY)
                + c.get(Calendar.MINUTE)
                + c.get(Calendar.SECOND);

        File photo = new File(getTempDirectoryPath(this.cordova.getActivity().getApplicationContext()), "Pic-" + this.date + ".jpg");
        return photo;
    }

    /**
     * Applies all needed transformation to the image received from the gallery.
     *
     * @param destType In which form should we return the image
     * @param intent   An Intent, which can return result data to the caller (various data can be attached to Intent "extras").
     */
    private void processResultFromGallery(int destType, Intent intent) {
        Uri uri = intent.getData();
        if (uri == null) {
            if (croppedUri != null) {
                uri = croppedUri;
            } else {
                this.failPicture("null data from photo library");
                return;
            }
        }
        int rotate = 0;

        // If you ask for video or all media type you will automatically get back a file URI
        // and there will be no attempt to resize any returned data
        if (this.mediaType != PICTURE) {
            this.callbackContext.success(getRealPathFromUri(this.cordova.getActivity(), uri));
        } else {
            // This is a special case to just return the path as no scaling,
            // rotating, nor compressing needs to be done
            if (this.targetHeight == -1 && this.targetWidth == -1 &&
                    (destType == FILE_URI || destType == NATIVE_URI)) {
                this.callbackContext.success(getRealPathFromUri(this.cordova.getActivity(), uri));
            } else {
                String uriString = uri.toString();
                // Get the path to the image. Makes loading so much easier.
                String mimeType = FileHelper.getMimeType(uriString, this.cordova);
                // If we don't have a valid image so quit.
                if (!("image/jpeg".equalsIgnoreCase(mimeType) || "image/png".equalsIgnoreCase(mimeType))) {
                    Log.d(LOG_TAG, "I either have a null image path or bitmap");
                    this.failPicture("Unable to retrieve path to picture!");
                    return;
                }
                Bitmap bitmap = null;
                try {
                    bitmap = getScaledBitmap(uriString);
                } catch (IOException e) {
                    e.printStackTrace();
                }
                if (bitmap == null) {
                    Log.d(LOG_TAG, "I either have a null image path or bitmap");
                    this.failPicture("Unable to create bitmap!");
                    return;
                }

//                if (this.correctOrientation) {
//                    rotate = getImageOrientation(uri);
//                    if (rotate != 0) {
//                        Matrix matrix = new Matrix();
//                        matrix.setRotate(rotate);
//                        try {
//                            bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
//                            this.orientationCorrected = true;
//                        } catch (OutOfMemoryError oom) {
//                            this.orientationCorrected = false;
//                        }
//                    }
//                }

                // If sending base64 image back
                if (destType == DATA_URL) {
                    this.processPicture(bitmap);
                }

                // If sending filename back
                else if (destType == FILE_URI || destType == NATIVE_URI) {
                    // Did we modify the image?
                    if (this.targetHeight > 0 && this.targetWidth > 0) {
                        try {
                            String modifiedPath = this.ouputModifiedBitmap(bitmap, uri);
                            // The modified image is cached by the app in order to get around this and not have to delete you
                            // application cache I'm adding the current system time to the end of the file url.
                            this.callbackContext.success("file://" + modifiedPath + "?" + System.currentTimeMillis());
                        } catch (Exception e) {
                            e.printStackTrace();
                            this.failPicture("Error retrieving image.");
                        }
                    } else {
                        this.callbackContext.success(getRealPathFromUri(this.cordova.getActivity(), uri));
                    }
                }
                if (bitmap != null) {
                    bitmap.recycle();
                    bitmap = null;
                }
                System.gc();
            }
        }
    }

    /**
     * Compress bitmap using jpeg, convert to Base64 encoded string, and return to JavaScript.
     *
     * @param bitmap
     */
    public void processPicture(Bitmap bitmap) {
        ByteArrayOutputStream jpeg_data = new ByteArrayOutputStream();
        try {
            if (bitmap.compress(CompressFormat.JPEG, mQuality, jpeg_data)) {
                byte[] code = jpeg_data.toByteArray();
                byte[] output = Base64.encode(code, Base64.NO_WRAP);
                String js_out = new String(output);
                this.callbackContext.success(js_out);
                js_out = null;
                output = null;
                code = null;
            }
        } catch (Exception e) {
            this.failPicture("Error compressing image.");
        }
        jpeg_data = null;
    }

    private String ouputModifiedBitmap(Bitmap bitmap, Uri uri) throws IOException {
        // Create an ExifHelper to save the exif data that is lost during compression
        String modifiedPath = getTempDirectoryPath(this.cordova.getActivity().getApplicationContext()) + "/modified.jpg";

        OutputStream os = new FileOutputStream(modifiedPath);
        bitmap.compress(Bitmap.CompressFormat.JPEG, this.mQuality, os);
        os.close();

        // Some content: URIs do not map to file paths (e.g. picasa).
        String realPath = FileHelper.getRealPath(uri, this.cordova);
        ExifHelper exif = new ExifHelper();
        if (realPath != null && this.encodingType == JPEG) {
            try {
                exif.createInFile(realPath);
                exif.readExifData();
//                if (this.correctOrientation && this.orientationCorrected) {
//                    exif.resetOrientation();
//                }
                exif.createOutFile(modifiedPath);
                exif.writeExifData();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return modifiedPath;
    }

    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        if (requestCode == 2) {
            if (resultCode == Activity.RESULT_OK && intent != null) {
                this.processResultFromGallery(this.destType, intent);
            } else if (resultCode == Activity.RESULT_CANCELED) {
                this.failPicture("Selection cancelled.");
            } else {
                this.failPicture("Selection did not complete!");
            }

            return;
        }

        // If image available
        if (requestCode == 1 && resultCode == Activity.RESULT_OK) {
            int rotate = 0;
            try {
                // Create an ExifHelper to save the exif data that is lost
                // during compression
                ExifHelper exif = new ExifHelper();
                exif.createInFile(getTempDirectoryPath(this.cordova.getActivity().getApplicationContext())
                        + "/Pic-" + this.date + ".jpg");
                exif.readExifData();
                rotate = exif.getOrientation();

                // Read in bitmap of captured image
                Bitmap bitmap;

                if (this.photo.exists()) {
                    final BitmapFactory.Options options = new BitmapFactory.Options();
                    options.inSampleSize = 2;

                    bitmap = BitmapFactory.decodeFile(this.photo.getAbsolutePath(), options);
                } else if (intent != null) {
                    Uri uri = intent.getData();

                    android.content.ContentResolver resolver = this.cordova.getActivity().getContentResolver();
                    bitmap = BitmapFactory.decodeStream(resolver.openInputStream(uri));
                } else {
                    this.failPicture("Intent is null");
                    return;
                }

                // If bitmap cannot be decoded, this may return null
                if (bitmap == null) {
                    this.failPicture("Error decoding image.");
                    return;
                }

                bitmap = scaleBitmap(bitmap);

                // Add compressed version of captured image to returned media
                // store Uri
                bitmap = getRotatedBitmap(rotate, bitmap, exif);
                Log.i(LOG_TAG, "URI: " + this.imageUri.toString());
                OutputStream os = this.cordova.getActivity().getContentResolver()
                        .openOutputStream(this.imageUri);
                bitmap.compress(Bitmap.CompressFormat.JPEG, this.mQuality, os);
                os.close();

                // Restore exif data to file
                exif.createOutFile(this.imageUri.getPath());
                exif.writeExifData();

                // Send Uri back to JavaScript for viewing image
                this.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, this.imageUri.toString()));

                bitmap.recycle();
                bitmap = null;
                System.gc();
            } catch (IOException e) {
                e.printStackTrace();
                this.failPicture("Error capturing image.");
            }
        }

        // If cancelled
        else if (resultCode == Activity.RESULT_CANCELED) {
            this.failPicture("Camera cancelled.");
        }

        // If something else
        else {
            this.failPicture("Did not complete!");
        }
    }

    /**
     * Return a scaled bitmap based on the target width and height
     *
     * @param imagePath
     * @return
     * @throws IOException
     */
    private Bitmap getScaledBitmap(String imageUrl) throws IOException {
        // If no new width or height were specified return the original bitmap
        if (this.targetWidth <= 0 && this.targetHeight <= 0) {
            InputStream fileStream = null;
            Bitmap image = null;
            try {
                fileStream = FileHelper.getInputStreamFromUriString(imageUrl, cordova);
                image = BitmapFactory.decodeStream(fileStream);
            } finally {
                if (fileStream != null) {
                    try {
                        fileStream.close();
                    } catch (IOException e) {
                        LOG.d(LOG_TAG, "Exception while closing file input stream.");
                    }
                }
            }
            return image;
        }

        // figure out the original width and height of the image
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        InputStream fileStream = null;
        try {
            fileStream = FileHelper.getInputStreamFromUriString(imageUrl, cordova);
            BitmapFactory.decodeStream(fileStream, null, options);
        } finally {
            if (fileStream != null) {
                try {
                    fileStream.close();
                } catch (IOException e) {
                    LOG.d(LOG_TAG, "Exception while closing file input stream.");
                }
            }
        }

        //CB-2292: WTF? Why is the width null?
        if (options.outWidth == 0 || options.outHeight == 0) {
            return null;
        }

        // determine the correct aspect ratio
        int[] widthHeight = calculateAspectRatio(options.outWidth, options.outHeight);

        // Load in the smallest bitmap possible that is closest to the size we want
        options.inJustDecodeBounds = false;
        options.inSampleSize = calculateSampleSize(options.outWidth, options.outHeight, this.targetWidth, this.targetHeight);
        Bitmap unscaledBitmap = null;
        try {
            fileStream = FileHelper.getInputStreamFromUriString(imageUrl, cordova);
            unscaledBitmap = BitmapFactory.decodeStream(fileStream, null, options);
        } finally {
            if (fileStream != null) {
                try {
                    fileStream.close();
                } catch (IOException e) {
                    LOG.d(LOG_TAG, "Exception while closing file input stream.");
                }
            }
        }
        if (unscaledBitmap == null) {
            return null;
        }

        return Bitmap.createScaledBitmap(unscaledBitmap, widthHeight[0], widthHeight[1], true);
    }

    /**
     * Maintain the aspect ratio so the resulting image does not look smooshed
     *
     * @param origWidth
     * @param origHeight
     * @return
     */
    public int[] calculateAspectRatio(int origWidth, int origHeight) {
        int newWidth = this.targetWidth;
        int newHeight = this.targetHeight;

        // If no new width or height were specified return the original bitmap
        if (newWidth <= 0 && newHeight <= 0) {
            newWidth = origWidth;
            newHeight = origHeight;
        }
        // Only the width was specified
        else if (newWidth > 0 && newHeight <= 0) {
            newHeight = (newWidth * origHeight) / origWidth;
        }
        // only the height was specified
        else if (newWidth <= 0 && newHeight > 0) {
            newWidth = (newHeight * origWidth) / origHeight;
        }
        // If the user specified both a positive width and height
        // (potentially different aspect ratio) then the width or height is
        // scaled so that the image fits while maintaining aspect ratio.
        // Alternatively, the specified width and height could have been
        // kept and Bitmap.SCALE_TO_FIT specified when scaling, but this
        // would result in whitespace in the new image.
        else {
            double newRatio = newWidth / (double) newHeight;
            double origRatio = origWidth / (double) origHeight;

            if (origRatio > newRatio) {
                newHeight = (newWidth * origHeight) / origWidth;
            } else if (origRatio < newRatio) {
                newWidth = (newHeight * origWidth) / origHeight;
            }
        }

        int[] retval = new int[2];
        retval[0] = newWidth;
        retval[1] = newHeight;
        return retval;
    }

    /**
     * Figure out what ratio we can load our image into memory at while still being bigger than
     * our desired width and height
     *
     * @param srcWidth
     * @param srcHeight
     * @param dstWidth
     * @param dstHeight
     * @return
     */
    public static int calculateSampleSize(int srcWidth, int srcHeight, int dstWidth, int dstHeight) {
        final float srcAspect = (float) srcWidth / (float) srcHeight;
        final float dstAspect = (float) dstWidth / (float) dstHeight;

        if (srcAspect > dstAspect) {
            return srcWidth / dstWidth;
        } else {
            return srcHeight / dstHeight;
        }
    }

    public Bitmap scaleBitmap(Bitmap bitmap) {
        int newWidth = this.targetWidth;
        int newHeight = this.targetHeight;
        int origWidth = bitmap.getWidth();
        int origHeight = bitmap.getHeight();

        // If no new width or height were specified return the original bitmap
        if (newWidth <= 0 && newHeight <= 0) {
            return bitmap;
        }
        // Only the width was specified
        else if (newWidth > 0 && newHeight <= 0) {
            newHeight = (newWidth * origHeight) / origWidth;
        }
        // only the height was specified
        else if (newWidth <= 0 && newHeight > 0) {
            newWidth = (newHeight * origWidth) / origHeight;
        }
        // If the user specified both a positive width and height
        // (potentially different aspect ratio) then the width or height is
        // scaled so that the image fits while maintaining aspect ratio.
        // Alternatively, the specified width and height could have been
        // kept and Bitmap.SCALE_TO_FIT specified when scaling, but this
        // would result in whitespace in the new image.
        else {
            double newRatio = newWidth / (double) newHeight;
            double origRatio = origWidth / (double) origHeight;

            if (origRatio > newRatio) {
                newHeight = (newWidth * origHeight) / origWidth;
            } else if (origRatio < newRatio) {
                newWidth = (newHeight * origWidth) / origHeight;
            }
        }

        return Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true);
    }

    private Bitmap getRotatedBitmap(int rotate, Bitmap bitmap, ExifHelper exif) {
        Matrix matrix = new Matrix();
        matrix.setRotate(rotate);
        try {
            bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
            exif.resetOrientation();
        } catch (OutOfMemoryError oom) {
            // You can run out of memory if the image is very large:
            // http://simonmacdonald.blogspot.ca/2012/07/change-to-camera-code-in-phonegap-190.html
            // If this happens, simply do not rotate the image and return it unmodified.
            // If you do not catch the OutOfMemoryError, the Android app crashes.
        }
        return bitmap;
    }

    private String getTempDirectoryPath(Context ctx) {
        File cache = null;

        // SD Card Mounted
        if (Environment.getExternalStorageState().equals(
                Environment.MEDIA_MOUNTED)) {
            cache = new File(Environment.getExternalStorageDirectory()
                    .getAbsolutePath()
                    + "/Android/data/"
                    + ctx.getPackageName() + "/cache/");
        }
        // Use internal storage
        else {
            cache = ctx.getCacheDir();
        }

        // Create the cache directory if it doesn't exist
        if (!cache.exists()) {
            cache.mkdirs();
        }

        return cache.getAbsolutePath();
    }

    public String getRealPathFromUri(Context context, Uri contentUri) {
        Cursor cursor = null;
        try {
            String[] proj = {MediaStore.Images.Media.DATA};
            cursor = context.getContentResolver().query(contentUri, proj, null, null, null);
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
            cursor.moveToFirst();
            return "file://" + cursor.getString(column_index);
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

}