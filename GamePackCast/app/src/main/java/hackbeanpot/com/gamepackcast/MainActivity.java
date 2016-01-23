package hackbeanpot.com.gamepackcast;

import android.app.Activity;
import android.os.Bundle;
import android.support.v4.view.MenuItemCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.app.MediaRouteActionProvider;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.view.Menu;
import android.view.MenuItem;

import com.google.android.gms.cast.Cast;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.common.api.GoogleApiClient;

/**
 * Created by matcp_000 on 1/22/2016.
 */
public class MainActivity extends AppCompatActivity {
    private MediaRouter mRouter;
    private MediaRouter.Callback mCallback;
    private MediaRouteSelector mSelector;
    private CastDevice mSelectedDevice;

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mRouter = MediaRouter.getInstance(this);
        mSelector = new MediaRouteSelector.Builder()
                .addControlCategory(CastMediaControlIntent.categoryForCast("D2E6DFBD"))
                .build();
        mCallback = new MyCallback();
    }
    // Add the callback on start to tell the media router what kinds of routes
    // the application is interested in so that it can try to discover suitable ones.
    public void onStart() {
        super.onStart();

        mRouter.addCallback(mSelector, mCallback,
                MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);

        MediaRouter.RouteInfo route = mRouter.updateSelectedRoute(mSelector);
        // do something with the route...
    }

    // Remove the selector on stop to tell the media router that it no longer
    // needs to invest effort trying to discover routes of these kinds for now.
    public void onStop() {
        super.onStop();

        mRouter.removeCallback(mCallback);
    }

    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);

        getMenuInflater().inflate(R.menu.menu, menu);

        MenuItem mediaRouteMenuItem = menu.findItem(R.id.media_route_menu_item);
        MediaRouteActionProvider mediaRouteActionProvider =
                (MediaRouteActionProvider)MenuItemCompat.getActionProvider(mediaRouteMenuItem);
        mediaRouteActionProvider.setRouteSelector(mSelector);
        return true;
    }

    private final class MyCallback extends MediaRouter.Callback {
        // Implement callback methods as needed.

        @Override
        public void onRouteSelected(MediaRouter router, MediaRouter.RouteInfo info) {
            mSelectedDevice = CastDevice.getFromBundle(info.getExtras());
            String routeId = info.getId();
        }

        @Override
        public void onRouteUnselected(MediaRouter router, MediaRouter.RouteInfo info) {
            //teardown();
            mSelectedDevice = null;
        }
    }
}

