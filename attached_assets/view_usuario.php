<script src="../js/console_usuario.js?rev=<?php echo time();?>"></script>
    <!-- Content Header (Page header) -->
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">MANTENIMIENTO USUARIO</h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item active">Usuario</li>
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
          <!-- /.col-md-6 -->
          <div class="col-lg-12">
            <div class="card">
              <div class="card-header">
                <h5 class="m-0">Listado de usuario</h5>
                <button class="btn btn-danger btn-sm float-right" onclick="AbrirRegistro()"> <i class="fas fa-plus"> </i>Nuevo Registro</button>
              </div>
              <div class="card-body">
              <table id="tabla_usuario" class="display" style="width:100%">
                  <thead>
                      <tr>
                          <th>#</th>
                          <th>Usuario</th>
                          <th>Area</th>
                          <th>Rol</th>
                          <th>Empleado</th>
                          <th>Estatus</th>
                          <th>Acción</th>
                      </tr>
                  </thead>
              </table>
              </div>
            </div>

          </div>
          <!-- /.col-md-6 -->
        </div>
        <!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- Modal -->
<div class="modal fade" id="modal_registro"  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">REGISTRO DE USUARIO</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="row">
            <div class="col-6">
                <label for="">USUARIO</label>
                <input type="text" class="form-control" id="txt_usu">
            </div>
            <div class="col-6">
                <label for="">CONTRASEÑA</label>
                <input type="password" class="form-control" id="txt_con">
            </div>
            <div class="col-12">
              <label for="">EMPLEADO</label>
              <select class="js-example-basic-single" id="select_empleado" style="width:100%">
              </select>
            </div>
            <div class="col-6">
              <label for="">AREA</label>
              <select class="js-example-basic-single" id="select_area" style="width:100%">
              </select>
            </div>
            <div class="col-6">
              <label for="">ROL</label>
              <select class="js-example-basic-single" id="select_rol" style="width:100%">
                <option value="Secretario (a)">SECRETARIO(A)</option>
                <option value="Administrador">ADMINISTRADOR</option>
              </select>
            </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-success" onclick="Registar_Usuario()">REGISTRAR</button>
      </div>
    </div>
  </div>
</div>    
<!-- Modal -->
    <!-- Modal -->
<div class="modal fade" id="modal_editar"  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">EDITAR DATOS DE USUARIO</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="row">
            <div class="col-12">
                <label for="">USUARIO</label>
                <input type="text" class="form-control" id="txt_usu_editar" disabled>
                <input type="text" id="txt_idusuario" hidden>
            </div>
            <div class="col-12">
              <label for="">EMPLEADO</label>
              <select class="js-example-basic-single" id="select_empleado_editar" style="width:100%">
              </select>
            </div>
            <div class="col-6">
              <label for="">AREA</label>
              <select class="js-example-basic-single" id="select_area_editar" style="width:100%">
              </select>
            </div>
            <div class="col-6">
              <label for="">ROL</label>
              <select class="js-example-basic-single" id="select_rol_editar" style="width:100%">
                <option value="Secretario (a)">SECRETARIO(A)</option>
                <option value="Administrador">ADMINISTRADOR</option>
              </select>
            </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-success" onclick="Modificar_Usuario()">MODIFICAR</button>
      </div>
    </div>
  </div>
</div>    
<!-- Modal -->
    <!-- Modal -->
    <div class="modal fade" id="modal_contra"  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">EDITAR CONTRASEÑA DE USUARIO</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="row">
            <div class="col-12">
                <label for="">CONTRASEÑA</label>
                <input type="password" class="form-control" id="txt_contra_nueva">
                <input type="text" id="txt_idusuario_contra" hidden>
            </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-success" onclick="Modificar_Usuario_Contra()">MODIFICAR</button>
      </div>
    </div>
  </div>
</div>    
<!-- Modal -->
    <!-- /.content -->
    <script>
      $(document).ready(function() {
        listar_usuario();
        $('.js-example-basic-single').select2();
        Cargar_Select_Empleado();
        Cargar_Select_Area();
      } );
    </script>