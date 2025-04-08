<script src="../js/console_empleado.js?rev=<?php echo time();?>"></script>
    <!-- Content Header (Page header) -->
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">MANTENIMIENTO EMPLEADO</h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item active">Empleado</li>
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
                <h3 class="card-title"><b>Listado de empleado</b></h3>
                <button class="btn btn-danger btn-sm float-right" onclick="AbrirRegistro()"> <i class="fas fa-plus"> </i>Nuevo Registro</button>
              </div>
              <div class="card-body">
              <table id="tabla_empleado" class="display" style="width:100%">
                  <thead>
                      <tr>
                          <th>#</th>
                          <th>Foto</th>
                          <th>Nro Documento</th>
                          <th>Empleado</th>
                          <th>Movil</th>
                          <th>Email</th>
                          <th>Dirección</th>
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
    <!-- /.content -->
<!-- Modal -->
<div class="modal fade" id="modal_registro" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">REGISTRO DE EMPLEADO</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="row">
            <div class="col-4">
                <label for="">Nro Documento</label>
                <input type="text" class="form-control" id="txt_nro" onkeypress="return soloNumeros(event)">
            </div>
            <div class="col-8">
                <label for="">Nombres</label>
                <input type="text" class="form-control" id="txt_nom" onkeypress="return soloLetras(event)">
            </div>
            <div class="col-6">
                <label for="">Apellido Paterno</label>
                <input type="text" class="form-control" id="txt_apepa" onkeypress="return soloLetras(event)">
            </div>
            <div class="col-6">
                <label for="">Apellido Materno</label>
                <input type="text" class="form-control" id="txt_apema" onkeypress="return soloLetras(event)">
            </div>
            <div class="col-6">
                <label for="">Fecha Nacimiento</label>
                <input type="date" class="form-control" id="txt_fnac">
            </div>
            <div class="col-6">
                <label for="">Movil</label>
                <input type="text" class="form-control" id="txt_movil" onkeypress="return soloNumeros(event)">
            </div>
            <div class="col-12">
                <label for="">Dirección</label>
                <input type="text" class="form-control" id="txt_dire">
            </div>
            <div class="col-12">
                <label for="">Email</label>
                <input type="text" class="form-control" id="txt_email">
            </div>

        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-success" onclick="Registrar_Empleado()">REGISTRAR</button>
      </div>
    </div>
  </div>
</div>    

<!-- Modal -->
<div class="modal fade" id="modal_editar" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">EDITAR DATOS DE EMPLEADO</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="row">
            <div class="col-4">
                <input type="text" id="txt_idempleado" hidden>
                <label for="">Nro Documento</label>
                <input type="text" class="form-control" id="txt_nro_editar" onkeypress="return soloNumeros(event)">
            </div>
            <div class="col-8">
                <label for="">Nombres</label>
                <input type="text" class="form-control" id="txt_nom_editar" onkeypress="return soloLetras(event)">
            </div>
            <div class="col-6">
                <label for="">Apellido Paterno</label>
                <input type="text" class="form-control" id="txt_apepa_editar" onkeypress="return soloLetras(event)">
            </div>
            <div class="col-6">
                <label for="">Apellido Materno</label>
                <input type="text" class="form-control" id="txt_apema_editar" onkeypress="return soloLetras(event)">
            </div>
            <div class="col-6">
                <label for="">Fecha Nacimiento</label>
                <input type="date" class="form-control" id="txt_fnac_editar">
            </div>
            <div class="col-6">
                <label for="">Movil</label>
                <input type="text" class="form-control" id="txt_movil_editar" onkeypress="return soloNumeros(event)">
            </div>
            <div class="col-12">
                <label for="">Dirección</label>
                <input type="text" class="form-control" id="txt_dire_editar">
            </div>
            <div class="col-8">
                <label for="">Email</label>
                <input type="text" class="form-control" id="txt_email_editar">
            </div>
            <div class="col-4">
                <label for="">Estatus</label>
                  <select name="" id="select_estatus" class="form-control">
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                  </select>
            </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-success" onclick="Modificar_Empleado()">MODIFICAR</button>
      </div>
    </div>
  </div>
</div>    
<!-- Modal -->
    <script>
      $(document).ready(function() {
        listar_empleado();
      } );
      $('#modal_registro').on('shown.bs.modal', function () {
        $('#txt_nro').trigger('focus')
       })
    </script>