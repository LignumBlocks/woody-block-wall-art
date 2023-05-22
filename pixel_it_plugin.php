<?php
/**
 * Plugin Name: Pixel It Plugin
 * Plugin URI: https://www.kode.com.co/
 * Description: Pixel it plugin to add wood pixel art products functionality.
 * Version: 1.2
 * Author: Juan Esteban Cerquera
 * Author URI: https://www.kode.com.co/
 **/


/**
 * Enqueue my scripts and assets. load js scripts in the corresponding page
 *
 */
function my_enqueue() {   

    wp_enqueue_script(
        'ajax-script2',
        plugins_url( '/js/cropper.js', __FILE__ ),
        array( 'jquery' ),
        '1.0.0',
        true
    );


    wp_enqueue_script(
        'ajax-script4',
        plugins_url( '/js/kmeans.js', __FILE__ ),
        array( 'jquery' ),
        '1.0.0',
        true
    );

    wp_enqueue_script(
        'ajax-script3',
        plugins_url( '/js/main.js', __FILE__ ),
        array( 'jquery' ),
        '1.0.0',
        true
    );


    wp_enqueue_script(
        'ajax-script5',
        plugins_url( '/js/jspdf.js', __FILE__ ),
        array( 'jquery' ),
        '1.0.0',
        true
    );


    wp_enqueue_style(
        'ajax-style',
        plugins_url( '/css/cropper.css', __FILE__ ),
        array(),
        '1.0.0',
        'all'
    );

    wp_enqueue_style(
        'custom-style',
        plugins_url( '/css/custom.css', __FILE__ ),
        array(),
        '1.0.0',
        'all'
    );
   

    // send variables to the js script to use them in the ajax request, like the ajax url, the nonce, the cart url, etc.
    // They are accessed in the js script like wp_variables.ajax_url, wp_variables.nonce, etc.
    wp_localize_script(
        'ajax-script2',
        'wp_variables',
        array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'title_example' ),
            'cart_url' => wc_get_cart_url(),
            'default_image' => plugins_url( '/resources/default.png', __FILE__ ),
            'resources_path' => plugins_url( '/resources', __FILE__ ),
        )
    );
}

add_action("wp_enqueue_scripts", "my_enqueue");
add_action( 'admin_enqueue_scripts', 'my_enqueue' );

/**
 * Handles my AJAX request for product price change
 */
function my_ajax_handler() {
    check_ajax_referer( 'title_example' );
    $price = wp_unslash( $_POST['price'] );


    $uploads = wp_upload_dir();
    $blueprintFile = $_POST['blueprint'];
    $blueprintFile2 = $_POST['coloredBlueprint'];

    $filename = uniqid() . '.pdf';
    $file = $uploads['path'].'/'. $filename;
    $downloadPath = $uploads['url'].'/'. $filename;
    $success = file_put_contents($file, base64_decode($blueprintFile));

    $filename2 = uniqid() . "_2" . '.pdf';
    $file2 = $uploads['path'].'/'. $filename2;
    $downloadPath2 = $uploads['url'].'/'. $filename2;
    $success2 = file_put_contents($file2, base64_decode($blueprintFile2));

    $image_data = $_POST['pixelated_img_url'];
    $image_array_1 = explode(";", $image_data);
    $image_array_2 = explode(",", $image_array_1[1]);
    $data = base64_decode($image_array_2[1]);
    $filename3 = uniqid() . "_3" . '.png';
    $file3 = $uploads['path'].'/'. $filename3;
    $downloadPath3 = $uploads['url'].'/'. $filename3;
    $success3 = file_put_contents($file3, $data);

    $product_id = 3061; //Own product id
    // Data to be stored in the cart product
    $data = array( '_custom_options' => $price,
        '_blueprint' => $downloadPath,
        '_coloredBlueprint' => $downloadPath2,
        "_pixelated_img_url" => $downloadPath3,
        );
    // Add the product to the cart
    WC()->cart->add_to_cart( $product_id, 1, 0,
        array(), $data);
    wp_die(); // All ajax handlers should die when finished
}
add_action( 'wp_ajax_nopriv_change_price', 'my_ajax_handler' );
add_action( 'wp_ajax_change_price', 'my_ajax_handler' );

/**
 * Add custom price to cart item
 */
function woocommerce_custom_price_to_cart_item( $cart_object ) {
    foreach ( $cart_object->cart_contents as $key => $value ) {
        if( isset( $value["_custom_options"] ) ) {
            $value['data']->set_price($value["_custom_options"]);
        }
    }
}
add_action( 'woocommerce_before_calculate_totals', 'woocommerce_custom_price_to_cart_item', 10 );



/**
 * Add custom meta to order
 */
function plugin_republic_checkout_create_order_line_item($item, $cart_item_key, $values, $order)
{
    if (isset($values['_blueprint'])) {
        $item->add_meta_data(
            "_blueprint",
            $values['_blueprint'],
            true
        );
    }

    if (isset($values['_coloredBlueprint'])) {
        $item->add_meta_data(
            "_coloredBlueprint",
            $values['_coloredBlueprint'],
            true
        );
    }
    if (isset($values['_pixelated_img_url'])) {
        $item->add_meta_data(
            "_pixelated_img_url",
            $values['_pixelated_img_url'],
            true
        );
    }


}

add_action('woocommerce_checkout_create_order_line_item', 'plugin_republic_checkout_create_order_line_item', 10, 4);

// Get custom order item meta and display a linked download button
add_action( 'woocommerce_after_order_itemmeta', 'display_admin_order_item_custom_button', 10, 3 );

/**
 * Display a custom button in admin order items to download the reports
 */
function display_admin_order_item_custom_button( $item_id, $item, $product ){
    // Only "line" items and backend order pages
    if( ! ( is_admin() && $item->is_type('line_item') ) )
        return;

    $file_url = $item->get_meta('_blueprint'); // Get custom item meta data (array)

    if( ! empty($file_url) ) {
        // Display a custom download button using custom meta for the link
        echo '<a href="' . $file_url . '" class="button download" download>' . __("Download", "woocommerce") . '</a>';
    }

    $file_url2 = $item->get_meta('_coloredBlueprint'); // Get custom item meta data (array)

    if( ! empty($file_url2) ) {
        // Display a custom download button using custom meta for the link
        echo '<a href="' . $file_url2 . '" class="button download" download>' . __("Download colored", "woocommerce") . '</a>';
    }

    $file_url3 = $item->get_meta('_pixelated_img_url'); // Get custom item meta data (array)

    if( ! empty($file_url3) ) {
        // Display a custom download button using custom meta for the link
        echo '<a href="' . $file_url3 . '" class="button download" download>' . __("Download Image", "woocommerce") . '</a>';
    }

}

/**
 * Replace product image in cart
 */
function custom_new_product_image( $_product_img, $cart_item, $cart_item_key ) {
    $a      =   '<img src="'.$cart_item['_pixelated_img_url'].'" />';
    return $a;
}

add_filter( 'woocommerce_cart_item_thumbnail', 'custom_new_product_image', 10, 3 );

add_filter( 'woocommerce_cart_item_permalink', 'my_remove_cart_product_link', 10 );

add_filter("script_loader_tag", "add_module_to_my_script", 10, 3);

function add_module_to_my_script($tag, $handle, $src)
{
    if ("ajax-script3" === $handle) {
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
    }

    return $tag;
}

function my_remove_cart_product_link() {
    return __return_null();
}