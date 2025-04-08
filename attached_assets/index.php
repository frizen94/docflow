<?php
    session_start();
    if(!isset($_SESSION['S_ID'])){
      header('Location: ../index.php');

    }

?>
<!DOCTYPE html>
<!--
This is a starter template page. Use this page to start your new project from
scratch. This page gets rid of all links and provides the needed markup only.
-->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AdminLTE 3 | Starter</title>

  <!-- Google Font: Source Sans Pro -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="../plantilla/plugins/fontawesome-free/css/all.min.css">
  <!-- Theme style -->
  <link rel="stylesheet" href="../plantilla/dist/css/adminlte.min.css">
  <link rel="stylesheet" type="text/css" href="../utilitario/DataTables/datatables.min.css"/>
  <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
</head>
<body class="hold-transition sidebar-mini">
<div class="wrapper">

  <!-- Navbar -->
  <nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
      </li>
  
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto">
      <!-- Notifications Dropdown Menu -->
      <li class="nav-item dropdown">
        
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
          <span class="dropdown-header">15 Notifications</span>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fas fa-envelope mr-2"></i> 4 new messages
            <span class="float-right text-muted text-sm">3 mins</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fas fa-users mr-2"></i> 8 friend requests
            <span class="float-right text-muted text-sm">12 hours</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="fas fa-file mr-2"></i> 3 new reports
            <span class="float-right text-muted text-sm">2 days</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
        </div>
      </li>
            <!-- Notifications Dropdown Menu -->
      <li class="nav-item dropdown">
        <a class="nav-link" data-toggle="dropdown" href="#">
        <?php  echo $_SESSION['S_USU']  ?>
        <i class="fas fa-caret-down"></i>
        </a>
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
          <a href="../controller/usuario/controlador_cerrar_sesion.php" class="dropdown-item">
            <i class="fas fa-file mr-2"></i> Cerrar Sesion
          </a>
      </li>
    </ul>
  </nav>
  <!-- /.navbar -->

  <!-- Main Sidebar Container -->
  <aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo -->
    <a href="index3.html" class="brand-link">
      <img src="../plantilla/dist/img/AdminLTELogo.png" alt="AdminLTE Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
      <span class="brand-text font-weight-light">SISTEMA TRAMITE</span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Sidebar user panel (optional) -->
      <div class="user-panel mt-3 pb-3 mb-3 d-flex">
        <div class="image">
          <img src="../plantilla/dist/img/user2-160x160.jpg" class="img-circle elevation-2" alt="User Image">
        </div>
        <div class="info">
          <a href="#" class="d-block">Alexander Pierce</a>
        </div>
      </div>

      <!-- SidebarSearch Form -->
      <div class="form-inline">
       
      </div>

      <!-- Sidebar Menu -->
      <nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
          <!-- Add icons to the links using the .nav-icon class
               with font-awesome or any other icon font library -->
        <?php if($_SESSION['S_ROL']=='Administrador') {?>
          <li class="nav-item">
            <a onclick="cargar_contenido('contenido_principal','tramite/view_tramite.php')" class="nav-link">
              <i class="nav-icon fas fa-file-signature"></i>
              <p>
                Tramite
              </p>
            </a>
          </li>
          <li class="nav-item">
            <a onclick="cargar_contenido('contenido_principal','usuario/view_usuario.php')" class="nav-link">
              <i class="nav-icon fas fa-user"></i>
              <p>
                Usuario
              </p>
            </a>
          </li>
          <li class="nav-item">
            <a onclick="cargar_contenido('contenido_principal','empleado/view_empleado.php')" class="nav-link">
              <i class="nav-icon fas fa-users"></i>
              <p>
                Empleado
              </p>
            </a>
          </li>
          <li class="nav-item">
            <a onclick="cargar_contenido('contenido_principal','area/view_area.php')" class="nav-link">
              <i class="nav-icon fas fa-th"></i>
              <p>
                Area
              </p>
            </a>
          </li>
          <li class="nav-item">
            <a onclick="cargar_contenido('contenido_principal','tipo_documento/view_tipodocumento.php')" class="nav-link">
              <i class="nav-icon fas fa-th"></i>
              <p>
                Tipo Documento
              </p>
            </a>
          </li>
          <?php 
          } 
          ?>
        <?php if($_SESSION['S_ROL']=='Secretario (a)') {?>
          <li class="nav-item">
            <a onclick="cargar_contenido('contenido_principal','tramite_area/view_tramite.php')" class="nav-link">
              <i class="nav-icon fas fa-file-signature"></i>
              <p>
                Tramite Recibidos
              </p>
            </a>
          </li>
          <?php 
          } 
          ?>  
        </ul>
      </nav>
      <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
  </aside>

  <!-- Content Wrapper. Contains page content -->
  <input type="text" id="txtprincipalid" value="<?php echo $_SESSION['S_ID']; ?>" hidden>
  <input type="text" id="txtprincipalusu" value="<?php echo $_SESSION['S_USU']; ?>" hidden>
  <input type="text" id="txtprincipalrol" value="<?php echo $_SESSION['S_ROL']; ?>" hidden>
  <div class="content-wrapper" id="contenido_principal">
    <!-- Content Header (Page header) -->
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Starter Page</h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item active">Starter Page</li>
            </ol>
          </div><!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

    <!-- Main content -->
    <div class="content">
      <div class="container-fluid">
        <div class="row">
        <?php if($_SESSION['S_ROL']=='Administrador') {?>
            <div class="col-lg-3 col-6">
                <!-- small card -->
                <div class="small-box bg-info">
                  <div class="inner">
                    <h3 id="lbl_tramite">0</h3>

                    <p>TRAMITES REGISTRADOS</p>
                  </div>
                  <div class="icon">
                    <i class="ion ion-stats-bars"></i>
                  </div>
                  <a onclick="cargar_contenido('contenido_principal','tramite/view_tramite.php')" class="small-box-footer">
                    Ver Tramites <i class="fas fa-arrow-circle-right"></i>
                  </a>
                </div>
            </div>
            <div class="col-lg-3 col-6">
                <!-- small card -->
                <div class="small-box bg-success">
                  <div class="inner">
                    <h3 id="lbl_tramite_finalizado">0</h3>

                    <p>TRAMITES FINALIZADOS</p>
                  </div>
                  <div class="icon">
                    <i class="ion ion-stats-bars"></i>
                  </div>
                  <a onclick="cargar_contenido('contenido_principal','tramite/view_tramite.php')" class="small-box-footer">
                    Ver Tramites <i class="fas fa-arrow-circle-right"></i>
                  </a>
                </div>
            </div>
            <?php 
            } 
            ?>  
        </div>
        <!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content -->
  </div>
  <!-- /.content-wrapper -->

  <!-- Control Sidebar -->
  <aside class="control-sidebar control-sidebar-dark">
    <!-- Control sidebar content goes here -->
    <div class="p-3">
      <h5>Title</h5>
      <p>Sidebar content</p>
    </div>
  </aside>
  <!-- /.control-sidebar -->

  <!-- Main Footer -->
  <footer class="main-footer">
    <!-- To the right -->
    <div class="float-right d-none d-sm-inline">
      Anything you want
    </div>
    <!-- Default to the left -->
    <strong>Copyright &copy; 2014-2021 <a href="https://adminlte.io">AdminLTE.io</a>.</strong> All rights reserved.
  </footer>
</div>
<!-- ./wrapper -->

<!-- REQUIRED SCRIPTS -->
<script>
    function cargar_contenido(id,vista){
        $("#"+id).load(vista);
    }

    var idioma_espanol = {
			select: {
			rows: "%d fila seleccionada"
			},
			"sProcessing":     "Procesando...",
			"sLengthMenu":     "Mostrar _MENU_ registros",
			"sZeroRecords":    "No se encontraron resultados",
			"sEmptyTable":     "Ning&uacute;n dato disponible en esta tabla",
			"sInfo":           "Registros del (_START_ al _END_) total de _TOTAL_ registros",
			"sInfoEmpty":      "Registros del (0 al 0) total de 0 registros",
			"sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
			"sInfoPostFix":    "",
			"sSearch":         "Buscar:",
			"sUrl":            "",
			"sInfoThousands":  ",",
			"sLoadingRecords": "<b>No se encontraron datos</b>",
			"oPaginate": {
					"sFirst":    "Primero",
					"sLast":     "Último",
					"sNext":     "Siguiente",
					"sPrevious": "Anterior"
			},
			"oAria": {
					"sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
					"sSortDescending": ": Activar para ordenar la columna de manera descendente"
			}
   }
   function soloNumeros(e){
      tecla = (document.all) ? e.keyCode : e.which;
      if (tecla==8){
          return true;
      }
      // Patron de entrada, en este caso solo acepta numeros
      patron =/[0-9]/;
      tecla_final = String.fromCharCode(tecla);
      return patron.test(tecla_final);
  }
  function soloLetras(e){
      key = e.keyCode || e.which;
      tecla = String.fromCharCode(key).toLowerCase();
      letras = " áéíóúabcdefghijklmnñopqrstuvwxyz";
      especiales = "8-37-39-46";
      tecla_especial = false
      for(var i in especiales){
          if(key == especiales[i]){
              tecla_especial = true;
              break;
          }
      }
      if(letras.indexOf(tecla)==-1 && !tecla_especial){
          return false;
      }
  }

  function filterFloat(evt,input){
    var key = window.Event ? evt.which : evt.keyCode;
    var chark = String.fromCharCode(key);
    var tempValue = input.value+chark;
    if(key >= 48 && key <= 57){
        if(filter(tempValue)=== false){
            return false;
        }else{
            return true;
        }
    }else{
          if(key == 8 || key == 13 || key == 0) {
              return true;
          }else if(key == 46){
                if(filter(tempValue)=== false){
                    return false;
                }else{
                    return true;
                }
          }else{
              return false;
          }
    }
}
function filter(__val__){
    var preg = /^([0-9]+\.?[0-9]{0,2})$/;
    if(preg.test(__val__) === true){
        return true;
    }else{
        return false;
    }
}
</script>
<!-- jQuery -->
<script src="../plantilla/plugins/jquery/jquery.min.js"></script>
<!-- Bootstrap 4 -->
<script src="../plantilla/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- AdminLTE App -->
<script src="../plantilla/dist/js/adminlte.min.js"></script>
<script type="text/javascript" src="../utilitario/DataTables/datatables.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script type="text/javascript" src="../js/console_webapi.js"></script>
<script>
  obtener_tokens();
<?php if($_SESSION['S_ROL']=='Administrador') {?>
  Traer_Widget();
  function Traer_Widget(){
    $.ajax({
        "url":"../controller/usuario/controlador_traer_widget.php",
        type:'POST'
    }).done(function(resp){
      
        let data = JSON.parse(resp);
        if(data.length>0){
          document.getElementById('lbl_tramite').innerHTML=data[0][0];
          document.getElementById('lbl_tramite_finalizado').innerHTML=data[0][1];
        }
    })
}
<?php 
    } 
  ?>  
</script>

</body>
</html>
