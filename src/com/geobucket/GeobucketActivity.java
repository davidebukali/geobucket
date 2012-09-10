package com.geobucket;

import android.os.Bundle;
import org.apache.cordova.*;

public class GeobucketActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        super.loadUrl("file:///android_asset/www/index.html",180000);
        super.setIntegerProperty("loadUrlTimeoutValue", 180000);
        
    }
}